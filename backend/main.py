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
cache = {
    "search": {},
    "analyze": {}
}


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
    df = pd.read_csv(files[0], usecols=["product_name", "Review", "Sentiment", "Rate", "Summary"])
    df.dropna(subset=["Review", "Sentiment", "Summary"], inplace=True)
    df["Sentiment"] = df["Sentiment"].str.strip().str.lower()
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
    global df, cache
    limit = min(limit, 200)
    
    cache_key = f"{q}_{limit}"
    if cache_key in cache["search"]:
        return cache["search"][cache_key]

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
            "text": row["Summary"],
            "short_label": row["Review"],
            "sentiment": row["Sentiment"],
            "rate": row["Rate"],
        }
        for _, row in matches.iterrows()
    ]
    
    result = {"query": q, "count": len(reviews), "reviews": reviews}
    cache["search"][cache_key] = result
    return result


class AnalyzeRequest(BaseModel):
    reviews: List[str]


@app.post("/analyze")
def analyze(body: AnalyzeRequest):
    global cache
    # Use hash of reviews list as cache key
    cache_key = hash(tuple(body.reviews))
    if cache_key in cache["analyze"]:
        return cache["analyze"][cache_key]

    results = []
    summary = {"positive": 0, "neutral": 0, "negative": 0, "total": len(body.reviews)}
    for text in body.reviews:
        pred = predict(text)
        label = pred["label"]
        results.append({"text": text, "label": label, "confidence": pred["confidence"]})
        if label in summary:
            summary[label] += 1
    
    result = {"summary": summary, "results": results}
    cache["analyze"][cache_key] = result
    return result
