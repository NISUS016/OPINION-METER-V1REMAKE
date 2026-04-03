import glob
import os
import pandas as pd
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from predict import predict

df = None
product_names = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    global df, product_names
    # Support running from both root and backend/ directory
    for path in ["flipkart-dataset", "../flipkart-dataset"]:
        files = glob.glob(f"{path}/*.csv")
        if files:
            break
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
    contains = [name for name in product_names if q_lower in name.lower() and not name.lower().startswith(q_lower)]
    combined = starts_with + contains
    return {"suggestions": combined[:limit]}


@app.get("/search")
def search(q: str = Query(...), limit: int = Query(50)):
    global df
    # Cap limit to prevent abuse
    limit = min(limit, 200)
    # Step 1: Try exact match (case-insensitive)
    exact = df[df["product_name"].str.strip().str.lower() == q.strip().lower()]
    if len(exact) > 0:
        matches = exact
    else:
        # Step 2: Substring match on product_name only
        matches = df[df["product_name"].str.contains(q, case=False, na=False)]
    matches = matches.head(limit)
    reviews = []
    for _, row in matches.iterrows():
        reviews.append(
            {
                "product_name": row["product_name"],
                "text": row["Review"],
                "sentiment": row["Sentiment"],
            }
        )
    return {"query": q, "count": len(reviews), "reviews": reviews}


class AnalyzeRequest(BaseModel):
    reviews: List[str]


@app.post("/analyze")
def analyze(body: AnalyzeRequest):
    results = []
    summary = {"positive": 0, "neutral": 0, "negative": 0, "total": len(body.reviews)}
    for text in body.reviews:
        pred = predict(text)
        results.append(
            {"text": text, "label": pred["label"], "confidence": pred["confidence"]}
        )
        summary[pred["label"]] += 1
    return {"summary": summary, "results": results}
