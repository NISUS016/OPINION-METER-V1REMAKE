# OpinionMeter

Sentiment analysis web app for Flipkart product reviews.

## Stack

- **Frontend:** React + Vite + Tailwind CSS + Recharts
- **Backend:** FastAPI + scikit-learn
- **Dataset:** Flipkart Product Reviews (~205K rows)

## Local Run Instructions

### 1. Train the model (once)

```bash
pip install pandas scikit-learn nltk joblib
python train_model.py
```

### 2. Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser

```
http://localhost:3000
```

## How It Works

1. Search for a product keyword (e.g. "phone", "earphones", "shirt")
2. The app fetches matching reviews from the Flipkart dataset
3. Reviews are run through an NLP + Logistic Regression pipeline
4. A sentiment breakdown chart and individual review cards are displayed
