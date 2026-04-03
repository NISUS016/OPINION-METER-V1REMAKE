import glob
import os
import pandas as pd
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from predict import predict

df = None
product_names = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    global df, product_names
    # Support running from both project root and backend/ directory
    files = []
    for path in ["flipkart-dataset", "../flipkart-dataset"]:
        files = glob.glob(f"{path}/*.csv")
        if files:
            break
    if not files:
        raise RuntimeError(
            "Dataset not found. Place the CSV in flipkart-dataset/ at the project root."
        )
    df = pd.read_csv(files[0], usecols=["product_name", "Review", "Sentiment"])
    df["Sentiment"] = df["Sentiment"].str.strip().str.lower()
    df.dropna(subset=["Review", "Sentiment"], inplace=True)
    product_names = sorted(df["product_name"].dropna().unique().tolist())
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/suggest")
def suggest(q: str = Query(..., min_length=1), limit: int = Query(10)):
    q_lower = q.lower()
    starts_with = [name for name in product_names if name.lower().startswith(q_lower)]
    contains = [
        name
        for name in product_names
        if q_lower in name.lower() and not name.lower().startswith(q_lower)
    ]
    return {"suggestions": (starts_with + contains)[:limit]}


@app.get("/search")
def search(q: str = Query(...), limit: int = Query(50)):
    global df
    limit = min(limit, 200)
    # Step 1: Exact match (case-insensitive)
    exact = df[df["product_name"].str.strip().str.lower() == q.strip().lower()]
    if len(exact) > 0:
        matches = exact
    else:
        # Step 2: Substring match — regex=False prevents crashes on special chars
        matches = df[
            df["product_name"].str.contains(q, case=False, na=False, regex=False)
        ]
    matches = matches.head(limit)
    reviews = [
        {
            "product_name": row["product_name"],
            "text": row["Review"],
            "sentiment": row["Sentiment"],
            "rate": row["Rate"],
        }
        for _, row in matches.iterrows()
    ]
    return {"query": q, "count": len(reviews), "reviews": reviews}


class AnalyzeRequest(BaseModel):
    reviews: List[str]


@app.post("/analyze")
def analyze(body: AnalyzeRequest):
    results = []
    summary = {"positive": 0, "neutral": 0, "negative": 0, "total": len(body.reviews)}
    for text in body.reviews:
        pred = predict(text)
        label = pred["label"]
        results.append({"text": text, "label": label, "confidence": pred["confidence"]})
        if label in summary:
            summary[label] += 1
    return {"summary": summary, "results": results}
