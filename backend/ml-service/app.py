"""CabineIQ ML Service — Flask API on port 8087."""

import os
import pickle
from datetime import datetime

import pandas as pd
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import create_engine, text

import train

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "http://localhost", "http://frontend"])

MODEL_DIR = os.getenv("MODEL_DIR", os.path.dirname(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
PHASE2_THRESHOLD = 1000
CACHED_PREDICTIONS = []


def get_engine():
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "3306")
    name = os.getenv("DB_NAME", "feedback_db")
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASS", "root")
    url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}"
    return create_engine(url)


def count_feedback_rows() -> int:
    try:
        engine = get_engine()
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM feedback"))
            return int(result.scalar() or 0)
    except Exception:
        return 0


def load_model():
    if not os.path.exists(MODEL_PATH):
        return None
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)


def rule_based_multiplier(avg_score: float) -> float:
    if avg_score >= 70:
        return 1.12
    if avg_score >= 40:
        return 1.05
    return 0.95


def confidence_from_count(count: int) -> float:
    return round(min(0.95, 0.5 + count / 200), 2)


def trend_from_scores(current: float, previous: float) -> str:
    if current > previous + 2:
        return "UP"
    if current < previous - 2:
        return "DOWN"
    return "STABLE"


def build_rule_based_predictions() -> list[dict]:
    try:
        engine = get_engine()
        query = """
            SELECT route, seat_class,
                   AVG(purchase_intent_score) AS avg_score,
                   COUNT(*) AS cnt
            FROM feedback
            WHERE route IS NOT NULL
            GROUP BY route, seat_class
            ORDER BY cnt DESC
            LIMIT 20
        """
        df = pd.read_sql(query, engine)
    except Exception:
        df = pd.DataFrame()

    if df.empty:
        return [
            {
                "route": "CMN-CDG",
                "seatClass": "ECONOMY",
                "recommendedMultiplier": 1.08,
                "confidence": 0.55,
                "trend": "STABLE",
                "basedOnResponses": 0,
            },
            {
                "route": "CMN-JFK",
                "seatClass": "BUSINESS",
                "recommendedMultiplier": 1.15,
                "confidence": 0.55,
                "trend": "STABLE",
                "basedOnResponses": 0,
            },
        ]

    predictions = []
    for _, row in df.iterrows():
        avg_score = float(row["avg_score"] or 50)
        count = int(row["cnt"] or 0)
        predictions.append({
            "route": str(row["route"]),
            "seatClass": str(row["seat_class"] or "ECONOMY"),
            "recommendedMultiplier": round(rule_based_multiplier(avg_score), 2),
            "confidence": confidence_from_count(count),
            "trend": trend_from_scores(avg_score, avg_score - 3),
            "basedOnResponses": count,
        })
    return predictions


def get_model_phase(row_count: int) -> str:
    if row_count < PHASE2_THRESHOLD:
        return "RULE_BASED"
    if row_count < 5000:
        return "XGBOOST_PHASE2"
    return "XGBOOST_PHASE3"


def get_last_trained() -> str:
    model = load_model()
    if model and model.get("trained_at"):
        return model["trained_at"]
    return datetime.utcnow().replace(hour=2, minute=0, second=0, microsecond=0).isoformat()


@app.route("/health")
def health():
    model = load_model()
    return jsonify({
        "status": "ok",
        "model_trained": model is not None,
        "last_trained": get_last_trained(),
        "row_count": count_feedback_rows(),
    })


@app.route("/predictions")
def predictions():
    global CACHED_PREDICTIONS
    row_count = count_feedback_rows()
    phase = get_model_phase(row_count)

    if phase == "RULE_BASED" or not os.path.exists(MODEL_PATH):
        preds = build_rule_based_predictions()
    else:
        preds = CACHED_PREDICTIONS or build_rule_based_predictions()

    CACHED_PREDICTIONS = preds
    return jsonify({
        "lastTrained": get_last_trained(),
        "modelPhase": phase,
        "predictions": preds,
    })


@app.route("/predict", methods=["POST"])
def predict():
    body = request.get_json(silent=True) or {}
    row_count = count_feedback_rows()
    phase = get_model_phase(row_count)

    score = calculate_rule_score(body)
    multiplier = rule_based_multiplier(score)

    if phase != "RULE_BASED":
        model = load_model()
        if model:
            try:
                features = {col: str(body.get(col, "UNKNOWN")) for col in train.FEATURE_COLS}
                frame = pd.DataFrame([features])
                encoded = model["encoder"].transform(frame)
                score = float(model["regressor"].predict(encoded)[0])
                multiplier = round(0.8 + (score / 100) * 0.7, 2)
            except Exception:
                pass

    segment = "HIGH_VALUE" if score >= 71 else "POTENTIAL" if score >= 41 else "PRICE_SENSITIVE"
    return jsonify({
        "score": round(score, 1),
        "multiplier": multiplier,
        "segment": segment,
        "modelPhase": phase,
    })


@app.route("/model-stats")
def model_stats():
    model = load_model()
    row_count = count_feedback_rows()
    if not model:
        return jsonify({
            "modelPhase": get_model_phase(row_count),
            "sampleCount": row_count,
            "rmse": None,
            "auc": None,
            "featureImportances": [],
        })

    reg = model.get("regressor")
    importances = []
    if reg is not None and hasattr(reg, "feature_importances_"):
        importances = [round(float(v), 4) for v in reg.feature_importances_[:10]]

    return jsonify({
        "modelPhase": model.get("phase", get_model_phase(row_count)),
        "sampleCount": model.get("sample_count", row_count),
        "rmse": model.get("rmse"),
        "auc": model.get("auc"),
        "featureImportances": importances,
    })


def calculate_rule_score(features: dict) -> float:
    score = 0.0
    return_intent = features.get("return_intent") or features.get("returnIntent")
    loyalty = features.get("loyalty_sensitive") or features.get("loyaltySensitive")
    flights = features.get("flights_per_year") or features.get("flightsPerYear")
    experience = features.get("experience_vs_expectation") or features.get("experienceVsExpectation")

    if return_intent == "BOOKED":
        score += 35
    elif return_intent == "PLANNED":
        score += 20

    if loyalty == "NO":
        score += 25
    elif loyalty == "DEPENDS":
        score += 12

    if flights == "10_PLUS":
        score += 20
    elif flights == "6_10":
        score += 15
    elif flights == "3_5":
        score += 10
    elif flights == "1_2":
        score += 5

    if experience == "BETTER":
        score += 20
    elif experience == "AS_EXPECTED":
        score += 10

    return min(score, 100)


def scheduled_train():
    try:
        train.train()
        global CACHED_PREDICTIONS
        CACHED_PREDICTIONS = build_rule_based_predictions()
    except Exception as exc:
        print(f"[SCHEDULER] Training failed: {exc}")


scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_train, "cron", hour=2, minute=0)
scheduler.start()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8087, debug=False)
