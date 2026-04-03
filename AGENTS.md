# OpinionMeter — Session Context

## Project Overview
Sentiment analysis web app for Flipkart product reviews (~205K rows).
- **Frontend:** React + Vite + Tailwind CSS v4 + Recharts
- **Backend:** FastAPI + scikit-learn (TF-IDF + Logistic Regression / Naive Bayes / Linear SVM)
- **Dataset:** `flipkart-dataset/Dataset-SA.csv` — columns: `product_name`, `product_price`, `Rate`, `Review`, `Summary`, `Sentiment`

## Repo Structure
```
├── flipkart-dataset/          # Dataset CSV (not in git)
├── backend/
│   ├── main.py                # FastAPI app: /health, /suggest, /search, /analyze
│   ├── predict.py             # Loads model.pkl, vectorizer.pkl, label_encoder.pkl; predict(text) -> {label, confidence}
│   ├── preprocess.py          # NLTK text cleaning pipeline
│   ├── requirements.txt       # Python deps
│   └── models/                # Trained model files (model.pkl, vectorizer.pkl, label_encoder.pkl)
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app: search -> analyze flow
│   │   ├── components/
│   │   │   ├── SearchBar.jsx  # Google-like autocomplete with debounced suggestions
│   │   │   ├── ResultsChart.jsx # Recharts pie chart for sentiment breakdown
│   │   │   └── ReviewCard.jsx # Review card with sentiment badge
│   │   └── index.css          # Tailwind imports
│   └── vite.config.js         # Vite config with Tailwind plugin + /api proxy to :8000
├── train_model.py             # Trains 3 models, picks best, saves to backend/models/
├── DESIGN.md                  # Architecture design doc
├── .gitignore
└── README.md
```

## How to Run

### First-time setup (teammates)
```bash
# Backend
python -m venv backend/venv
backend\venv\Scripts\activate
pip install -r backend/requirements.txt
python train_model.py          # Trains model, saves .pkl files

# Frontend
cd frontend
npm install
```

### Daily run
**Terminal 1 — Backend:**
```bash
backend\venv\Scripts\activate
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`

## API Endpoints
- `GET /health` — health check
- `GET /suggest?q={prefix}&limit=10` — autocomplete product names (starts-with first, then contains)
- `GET /search?q={query}&limit=50` — search reviews (exact match first, then substring on product_name, regex=False)
- `POST /analyze` — body: `{"reviews": ["text1", "text2"]}` → sentiment analysis results

## Key Design Decisions
- Dataset path resolution tries both `flipkart-dataset/` and `../flipkart-dataset/` (supports running from root or backend/)
- Search uses `regex=False` to prevent crashes on special characters like `C++` or `(phone)`
- LinearSVC wrapped in `CalibratedClassifierCV` so it supports `predict_proba()`
- `label_encoder.pkl` loaded in `predict.py` to decode integer predictions back to string labels
- Frontend uses `/api` prefix proxied by Vite to avoid CORS issues in dev
- Autocomplete debounced at 300ms, shows up to 10 suggestions with highlighted match

## Known Limitations
- No pagination on search results
- No production deployment setup
- Dataset not in git (too large)
- Model.pkl and vectorizer.pkl in git (needed for teammates but large)
