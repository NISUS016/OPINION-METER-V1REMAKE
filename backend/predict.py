import pickle
import os
from preprocess import preprocess

model_path = os.path.join(os.path.dirname(__file__), "models", "model.pkl")
vectorizer_path = os.path.join(os.path.dirname(__file__), "models", "vectorizer.pkl")

model = pickle.load(open(model_path, "rb"))
vectorizer = pickle.load(open(vectorizer_path, "rb"))


def predict(text: str) -> dict:
    clean = preprocess(text)
    vec = vectorizer.transform([clean])
    label = model.predict(vec)[0]
    proba = model.predict_proba(vec).max()
    return {"label": label, "confidence": round(float(proba), 4)}
