import glob
import pandas as pd
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
import sys

sys.path.insert(0, os.path.dirname(__file__))
from backend.preprocess import preprocess

print("Loading dataset...")
files = glob.glob("flipkart-dataset/*.csv")
df = pd.read_csv(files[0], usecols=["Review", "Sentiment"])
df["Sentiment"] = df["Sentiment"].str.strip().str.lower()
df.dropna(subset=["Review", "Sentiment"], inplace=True)

print("Preprocessing text...")
df["clean_review"] = df["Review"].apply(preprocess)

print("Vectorizing...")
vectorizer = TfidfVectorizer(
    max_features=50_000, ngram_range=(1, 2), min_df=2, sublinear_tf=True
)
X = vectorizer.fit_transform(df["clean_review"])

print("Encoding labels...")
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(df["Sentiment"])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

models = {
    "Logistic Regression": LogisticRegression(C=5, max_iter=1000),
    "Naive Bayes": MultinomialNB(),
    "Linear SVM": CalibratedClassifierCV(LinearSVC(), cv=3),
}

best_model = None
best_accuracy = 0
best_name = ""

for name, model in models.items():
    print(f"Training {name}...")
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    accuracy = accuracy_score(y_test, preds)
    print(f"  {name} accuracy: {accuracy:.4f}")
    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_model = model
        best_name = name

print(f"\nBest model: {best_name} with accuracy {best_accuracy:.4f}")

os.makedirs("backend/models", exist_ok=True)

with open("backend/models/model.pkl", "wb") as f:
    pickle.dump(best_model, f)
with open("backend/models/vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)
with open("backend/models/label_encoder.pkl", "wb") as f:
    pickle.dump(label_encoder, f)

print("Models saved to backend/models/")
