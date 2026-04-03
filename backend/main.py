import glob
import pandas as pd
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from predict import predict

df = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global df
    files = glob.glob("flipkart-dataset/*.csv")
    df = pd.read_csv(files[0], usecols=["product_name", "Review", "Sentiment"])
    df["Sentiment"] = df["Sentiment"].str.strip().str.lower()
    df.dropna(subset=["Review", "Sentiment"], inplace=True)
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


@app.get("/search")
def search(q: str = Query(...), limit: int = Query(50)):
    global df
    matches = df[df["product_name"].str.contains(q, case=False, na=False)]
    if len(matches) < 10:
        matches = df[df["Review"].str.contains(q, case=False, na=False)]
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
