"""Nightly XGBoost training script for CabineIQ ML service."""

import os
import pickle
from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sqlalchemy import create_engine
from xgboost import XGBClassifier, XGBRegressor

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
PHASE2_THRESHOLD = 1000

FEATURE_COLS = [
    "trip_purpose",
    "companion_count",
    "booking_window",
    "booking_channel",
    "flights_per_year",
    "competitor_used",
    "price_paid_range",
    "price_perception",
    "experience_vs_expectation",
    "comfort_rating",
    "service_rating",
    "return_intent",
    "next_travel_window",
    "booking_decision_factor",
    "loyalty_sensitive",
    "seat_class",
    "departure_hour",
    "occupancy_pct",
]


def get_engine():
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "3306")
    name = os.getenv("DB_NAME", "feedback_db")
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASS", "root")
    url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}"
    return create_engine(url)


def load_feedback_df():
    engine = get_engine()
    query = """
        SELECT trip_purpose, companion_count, booking_window, booking_channel,
               flights_per_year, competitor_used, price_paid_range, price_perception,
               experience_vs_expectation, comfort_rating, service_rating,
               return_intent, next_travel_window, booking_decision_factor,
               loyalty_sensitive, seat_class, departure_hour, occupancy_pct,
               purchase_intent_score, CAST(offer_clicked AS UNSIGNED) AS offer_clicked, route
        FROM feedback
        WHERE purchase_intent_score IS NOT NULL
    """
    return pd.read_sql(query, engine)


def encode_features(df: pd.DataFrame):
    X = df[FEATURE_COLS].copy()
    for col in FEATURE_COLS:
        X[col] = X[col].fillna("UNKNOWN").astype(str)
    encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    encoded = encoder.fit_transform(X)
    return encoded, encoder


def train():
    df = load_feedback_df()
    sample_count = len(df)
    print(f"[TRAIN] Loaded {sample_count} samples")

    if sample_count < PHASE2_THRESHOLD:
        print("[TRAIN] Not enough data for XGBoost — staying in RULE_BASED phase")
        return

    X, encoder = encode_features(df)
    y_score = df["purchase_intent_score"].astype(float)
    y_click = df["offer_clicked"].fillna(False).astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_score, test_size=0.2, random_state=42
    )
    _, _, y_click_train, y_click_test = train_test_split(
        X, y_click, test_size=0.2, random_state=42
    )

    reg = XGBRegressor(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
    )
    reg.fit(X_train, y_train)
    preds = reg.predict(X_test)
    rmse = float(np.sqrt(mean_squared_error(y_test, preds)))

    clf = XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
        use_label_encoder=False,
        eval_metric="logloss",
    )
    clf.fit(X_train, y_click_train)
    click_probs = clf.predict_proba(X_test)[:, 1]
    auc = float(roc_auc_score(y_click_test, click_probs)) if y_click_test.nunique() > 1 else 0.0

    artifact = {
        "regressor": reg,
        "classifier": clf,
        "encoder": encoder,
        "trained_at": datetime.utcnow().isoformat(),
        "sample_count": sample_count,
        "rmse": rmse,
        "auc": auc,
        "phase": "XGBOOST_PHASE2" if sample_count < 5000 else "XGBOOST_PHASE3",
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(artifact, f)

    print(f"[TRAIN] {sample_count} samples, RMSE={rmse:.1f}, AUC={auc:.2f}")


if __name__ == "__main__":
    train()
