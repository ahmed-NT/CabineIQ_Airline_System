"""
Génère un jeu de données d'entraînement synthétique mais réaliste pour le
modèle de scoring d'intention d'achat de CabineIQ.

- Remplit la table `feedback` (base feedback_db) avec N lignes.
- Les valeurs catégorielles reprennent exactement celles du formulaire de feedback.
- Le label `purchase_intent_score` est calculé avec la même règle que le service
  ML (calculate_rule_score), plus un léger bruit, afin que XGBoost apprenne une
  approximation de la règle métier.
- `offer_clicked` est corrélé au score (plus le score est élevé, plus la
  probabilité de clic est forte).

Usage :
    python generate_training_data.py            # insère 1500 lignes dans la BD
    python generate_training_data.py --rows 2000
    python generate_training_data.py --csv feedback_data.csv   # exporte aussi un CSV
"""

import argparse
import os
import random
from datetime import datetime, timedelta

import pandas as pd
from sqlalchemy import create_engine

random.seed(42)

# ── Domaines des variables catégorielles (identiques au formulaire) ────────────
TRIP_PURPOSE      = ["BUSINESS", "LEISURE", "FAMILY"]
COMPANION_COUNT   = ["ALONE", "PAIR", "GROUP"]
BOOKING_WINDOW    = ["LAST_MINUTE", "FEW_WEEKS", "MONTHS_AHEAD"]
BOOKING_CHANNEL   = ["WEBSITE", "MOBILE_APP", "AGENCY", "AIRPORT_COUNTER"]
FLIGHTS_PER_YEAR  = ["1_2", "3_5", "6_10", "10_PLUS"]
COMPETITOR_USED   = ["YES", "NO"]
PRICE_PAID_RANGE  = ["UNDER_100", "100_200", "200_400", "ABOVE_400"]
PRICE_PERCEPTION  = ["GREAT_DEAL", "FAIR", "TOO_EXPENSIVE"]
EXPERIENCE        = ["BETTER", "AS_EXPECTED", "WORSE"]
RETURN_INTENT     = ["BOOKED", "PLANNED", "NO"]
NEXT_TRAVEL       = ["THIS_MONTH", "1_3_MONTHS", "3_6_MONTHS", "NOT_SURE"]
DECISION_FACTOR   = ["LOWEST_PRICE", "BEST_SCHEDULE", "LOYALTY", "DIRECT_FLIGHT"]
LOYALTY_SENSITIVE = ["YES", "DEPENDS", "NO"]
SEAT_CLASS        = ["ECONOMY", "BUSINESS", "FIRST"]

# Routes principales depuis le hub de Casablanca (CMN)
ROUTES = [
    "CMN-CDG", "CMN-ORY", "CMN-MAD", "CMN-BCN", "CMN-LIS", "CMN-LHR",
    "CMN-BRU", "CMN-AMS", "CMN-FCO", "CMN-IST", "CMN-DXB", "CMN-JFK",
    "CMN-YUL", "CMN-DKR", "CMN-ABJ", "CMN-LOS", "CMN-TUN", "CMN-CAI",
]


def calculate_rule_score(row: dict) -> float:
    """Même logique que calculate_rule_score() du service ML."""
    score = 0.0

    if row["return_intent"] == "BOOKED":
        score += 35
    elif row["return_intent"] == "PLANNED":
        score += 20

    if row["loyalty_sensitive"] == "NO":
        score += 25
    elif row["loyalty_sensitive"] == "DEPENDS":
        score += 12

    flights = row["flights_per_year"]
    if flights == "10_PLUS":
        score += 20
    elif flights == "6_10":
        score += 15
    elif flights == "3_5":
        score += 10
    elif flights == "1_2":
        score += 5

    if row["experience_vs_expectation"] == "BETTER":
        score += 20
    elif row["experience_vs_expectation"] == "AS_EXPECTED":
        score += 10

    return min(score, 100.0)


def make_row(i: int) -> dict:
    seat_class = random.choices(SEAT_CLASS, weights=[0.72, 0.22, 0.06])[0]
    trip = random.choices(TRIP_PURPOSE, weights=[0.45, 0.40, 0.15])[0]

    row = {
        "trip_purpose": trip,
        "companion_count": random.choice(COMPANION_COUNT),
        "booking_window": random.choice(BOOKING_WINDOW),
        "booking_channel": random.choices(BOOKING_CHANNEL, weights=[0.45, 0.35, 0.12, 0.08])[0],
        "flights_per_year": random.choices(FLIGHTS_PER_YEAR, weights=[0.40, 0.33, 0.18, 0.09])[0],
        "competitor_used": random.choices(COMPETITOR_USED, weights=[0.35, 0.65])[0],
        "price_paid_range": random.choice(PRICE_PAID_RANGE),
        "price_perception": random.choices(PRICE_PERCEPTION, weights=[0.30, 0.50, 0.20])[0],
        "experience_vs_expectation": random.choices(EXPERIENCE, weights=[0.35, 0.50, 0.15])[0],
        "comfort_rating": random.randint(2, 5),
        "service_rating": random.randint(2, 5),
        "return_intent": random.choices(RETURN_INTENT, weights=[0.30, 0.45, 0.25])[0],
        "next_travel_window": random.choice(NEXT_TRAVEL),
        "booking_decision_factor": random.choice(DECISION_FACTOR),
        "loyalty_sensitive": random.choices(LOYALTY_SENSITIVE, weights=[0.40, 0.35, 0.25])[0],
        "seat_class": seat_class,
        "departure_hour": random.randint(0, 23),
        "departure_day": random.randint(1, 28),
        "departure_month": random.randint(1, 12),
        "occupancy_pct": round(random.uniform(45, 99), 1),
        "route": random.choice(ROUTES),
        "flight_id": random.randint(1, 50),
        "seat_id": f"{random.randint(1, 40)}{random.choice('ABCDEFGHJ')}",
    }

    # Label : règle métier + bruit gaussien léger, borné [0, 100]
    base = calculate_rule_score(row)
    noisy = base + random.gauss(0, 5)
    row["purchase_intent_score"] = int(max(0, min(100, round(noisy))))

    # Clic sur l'offre : probabilité croissante avec le score
    p_click = min(0.9, 0.05 + row["purchase_intent_score"] / 130.0)
    row["offer_clicked"] = 1 if random.random() < p_click else 0
    row["offer_shown"] = "UPGRADE" if seat_class == "ECONOMY" else "LOUNGE"

    row["submitted_at"] = datetime.utcnow() - timedelta(
        days=random.randint(0, 120), minutes=random.randint(0, 1440)
    )
    return row


def get_engine():
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "3306")
    name = os.getenv("DB_NAME", "feedback_db")
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASS", "root")
    url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}"
    return create_engine(url)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=1500, help="nombre de lignes à générer")
    parser.add_argument("--csv", type=str, default=None, help="exporter aussi un fichier CSV")
    parser.add_argument("--no-db", action="store_true", help="ne pas insérer dans la base")
    args = parser.parse_args()

    rows = [make_row(i) for i in range(args.rows)]
    df = pd.DataFrame(rows)

    # Aperçu de la distribution du label
    seg = pd.cut(df["purchase_intent_score"], [-1, 40, 70, 100],
                 labels=["PRICE_SENSITIVE", "POTENTIAL", "HIGH_VALUE"])
    print(f"[GEN] {len(df)} lignes générées")
    print("[GEN] Répartition des segments :")
    print(seg.value_counts().to_string())
    print(f"[GEN] Score moyen : {df['purchase_intent_score'].mean():.1f}")
    print(f"[GEN] Taux de clic : {df['offer_clicked'].mean():.1%}")

    if args.csv:
        df.to_csv(args.csv, index=False)
        print(f"[GEN] CSV écrit : {args.csv}")

    if not args.no_db:
        engine = get_engine()
        df.to_sql("feedback", engine, if_exists="append", index=False, chunksize=500)
        print(f"[GEN] {len(df)} lignes insérées dans feedback_db.feedback")


if __name__ == "__main__":
    main()
