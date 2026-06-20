# CabineIQ ML Service

## Setup
```bash
pip install -r requirements.txt
```

## Run
```bash
python app.py        # starts on port 8087
```

## Train manually
```bash
python train.py
```

## Phase transitions
- < 1000 feedback rows  → RULE_BASED scoring
- 1000-4999 rows        → XGBoost Phase 2
- 5000+ rows            → XGBoost + A/B testing (Phase 3, not yet implemented)
