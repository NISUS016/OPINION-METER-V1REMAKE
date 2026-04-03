import pickle
import os
from preprocess import preprocess

base = os.path.dirname(__file__)
model_path = os.path.join(base, "models", "model.pkl")
vectorizer_path = os.path.join(base, "models", "vectorizer.pkl")
label_encoder_path = os.path.join(base, "models", "label_encoder.pkl")

with open(model_path, "rb") as f:
    model = pickle.load(f)

with open(vectorizer_path, "rb") as f:
    vectorizer = pickle.load(f)

with open(label_encoder_path, "rb") as f:
    label_encoder = pickle.load(f)


def predict(text: str) -> dict:
    clean = preprocess(text)
    vec = vectorizer.transform([clean])
    label_int = model.predict(vec)[0]
    # Decode integer index back to string label ("positive", "neutral", "negative")
    label = label_encoder.inverse_transform([label_int])[0]
    proba = model.predict_proba(vec).max()
    return {"label": label, "confidence": round(float(proba), 4)}
