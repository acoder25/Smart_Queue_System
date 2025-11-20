import sys
import json
import pickle
import pandas as pd
import os
import prophet

# ---------- 1. Read CLI args ----------
# department: e.g. "Orthopedics"
# date_str:   e.g. "2025-11-24" (YYYY-MM-DD)
if len(sys.argv) != 3:
    print(json.dumps({"error": "Need department and date"}))
    sys.exit(1)

department = sys.argv[1]
date_str = sys.argv[2]

# ---------- 2. Map department to model file ----------
# Make sure these names match your actual files
DEPT_MODEL_MAP = {
    "Orthopedics": "Orthopedics.pkl",
    "Neurology": "Neurology.pkl",
    "Cardiology": "Cardiology.pkl",
    "Pediatrics":"Pediatrics.pkl",
    # add more here
}

if department not in DEPT_MODEL_MAP:
    print(json.dumps({"error": f"No model for department {department}"}))
    sys.exit(1)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "models", DEPT_MODEL_MAP[department])

# ---------- 3. Load model ----------
with open(model_path, "rb") as f:
    model = pickle.load(f)

# ---------- 4. Build 9AM–9PM dataframe ----------
# 9:00 to 21:00, hourly
hours = pd.date_range(f"{date_str} 09:00", f"{date_str} 21:00", freq="1H")
df_future = pd.DataFrame({"ds": hours})

# same feature engineering as training
df_future["hour_of_day"] = df_future["ds"].dt.hour
df_future["day_of_week"] = df_future["ds"].dt.dayofweek
df_future["is_weekend"] = df_future["day_of_week"].isin([5, 6]).astype(int)
df_future["is_peak_hour"] = df_future["hour_of_day"].between(10, 14).astype(int)

# ---------- 5. Predict ----------
forecast = model.predict(df_future)

result = []
for _, row in forecast.iterrows():
    result.append({
        "time": row["ds"].strftime("%H:%M"),
        "queue_length": float(row["yhat"])
    })

# ---------- 6. Output JSON ----------
print(json.dumps(result))
