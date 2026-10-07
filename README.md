# 🏥 Smart Queue System

An **ML-powered hospital queue recommendation and appointment management system** that forecasts queue lengths for different departments and time slots, combines historical forecasts with current user demand, identifies potentially busy slots, and helps patients make informed appointment choices.

The system also supports **user authentication, appointment booking, slot-intent tracking, Redis-based prediction caching, and email reminders for appointments**.

---

## 🚀 Key Features

- **Queue Forecasting:** Predicts expected queue length for hospital departments from **9 AM to 9 PM** using Facebook Prophet.
- **Rush/Non-Rush Classification:** Combines predicted queue length, current slot demand, relative ranking, and model confidence to identify potentially busy slots.
- **Slot Intent Tracking:** Tracks user interest in specific department/date/time slots and uses it as an additional demand signal.
- **Smart Caching:** Uses Redis to cache predictions and reduce repeated ML computation.
- **Appointment Booking:** Users can book appointments for selected departments and time slots.
- **User Authentication:** Supports registration and login using password hashing and JWT authentication.
- **Appointment Reminders:** Users can schedule email reminders for upcoming appointments using BullMQ and Redis.
- **Model Monitoring:** Records rank-based prediction/intent agreement metrics to monitor model behavior.

---

# 🏗️ System Architecture

```text
                         ┌──────────────────┐
                         │  React Frontend  │
                         └────────┬─────────┘
                                  │
                         REST API Requests
                                  │
                                  ▼
                     ┌──────────────────────┐
                     │ Node.js + Express    │
                     │      Backend        │
                     └───────┬───────┬──────┘
                             │       │
              ┌──────────────┘       └─────────────────┐
              │                                        │
              ▼                                        ▼
       ┌─────────────┐                         ┌─────────────┐
       │    Redis    │                         │  MongoDB    │
       │   Cache     │                         │             │
       └──────┬──────┘                         │ Users       │
              │                                │ Bookings    │
       Cache Hit?                              │ SlotIntent  │
              │                                │ ModelHealth │
        ┌─────┴─────┐                          └─────────────┘
        │           │
       Yes          No
        │           │
        │           ▼
        │    ┌────────────────┐
        │    │ Python ML      │
        │    │ Predict.py     │
        │    └───────┬────────┘
        │            │
        │            ▼
        │    ┌────────────────┐
        │    │ Prophet Models │
        │    │ per Department  │
        │    └───────┬────────┘
        │            │
        └────────────┘
                     │
                     ▼
          Predicted Queue Length
                     │
                     + Current Slot Intent
                     │
                     ▼
              Expected Queue
                     │
                     ▼
           Rush / Non-Rush Status
```

---

# 🤖 Queue Prediction

The system maintains a separate trained Prophet model for each supported department:

- Orthopedics
- Neurology
- Cardiology
- Pediatrics

The prediction service maps the requested department to its corresponding serialized model (`.pkl`) and loads its associated model metadata containing **RMSE and MAE**. 

For a requested date, the system generates hourly slots between **9 AM and 9 PM**. The same features used during model training are generated for the future slots:

- `hour_of_day`
- `day_of_week`
- `is_weekend`
- `is_peak_hour`

The Prophet model then produces the queue forecast. Negative predictions are clipped to zero and rounded to integer queue lengths.

Example prediction:

```text
09:00 → 12
10:00 → 15
11:00 → 21
12:00 → 28
13:00 → 24
...
```

The prediction service also returns:

- Predicted queue length for each slot
- RMSE
- MAE
- Mean predicted queue



---

# 🔥 Rush / Non-Rush Detection

The system does **not simply classify a slot based on whether its queue is above the average**.

Instead, it combines multiple signals.

## 1. Base ML Prediction

Prophet provides:

```text
queue_length
```

for each time slot.

## 2. Current Slot Intent

The backend retrieves intent information for the requested department and date:

```javascript
SlotIntent.find({ date, department })
```

The intent count represents current demand/interest for a particular time slot.

## 3. Expected Queue

The system combines the ML prediction with the current slot intent:

```text
expected_queue =
    predicted_queue +
    intent_count × intent_weight
```

The intent weight is dynamically determined from the model's mean predicted queue:

```javascript
INTENT_WEIGHT =
    Math.max(0.6, mean_queue × 0.15)
```

This allows current demand to influence the historical ML forecast.

---

## 4. Relative Ranking

All expected queue values are sorted, and each slot receives a relative rank.

This allows the system to identify slots that are among the highest-demand periods rather than relying only on an absolute queue number.

---

## 5. Confidence

A confidence score is calculated using:

- Relative rank of the expected queue
- Model RMSE
- Mean predicted queue

The system caps the displayed confidence at 95.

---

## 6. Final Classification

A slot is classified as **Rush** if either of two conditions is satisfied:

### Absolute Rush

The expected queue must be significantly above the average expected queue while satisfying the minimum queue requirement and low-confidence condition.

### Relative Rush

The slot must:

- Be approximately in the **top 25%** of expected queues
- Have an expected queue at least **15% above the mean expected queue**
- Have confidence ≤ 60

If neither condition is satisfied:

```text
status = "Non-Rush"
```

This gives the system a combination of **absolute demand and relative demand** rather than relying on a single fixed threshold.

---

# 🧠 Why Combine Prophet With Slot Intent?

Historical forecasting alone cannot always capture sudden changes in current demand.

For example:

```text
Prophet prediction:

10 AM → 15
11 AM → 17
12 PM → 18
```

Suppose many users suddenly show interest in 12 PM:

```text
12 PM intent → high
```

The system increases the expected demand for that slot using the intent signal.

Therefore:

```text
Historical Pattern
       +
Current User Intent
       ↓
Expected Demand
       ↓
Better Slot Recommendation
```

This allows the system to react to current user behavior instead of relying completely on historical patterns.

---

# ⚡ Redis Caching

Predictions are cached using a key based on department and date:

```text
queue:{department}:{date}
```

For example:

```text
queue:Cardiology:2026-10-10
```

When a request arrives:

```text
                 Request
                    │
                    ▼
                 Redis
                /     \
             HIT       MISS
              │          │
              ▼          ▼
          Return     Run Python
          cached      prediction
                         │
                         ▼
                       Cache
                         │
                         ▼
                       Return
```

The cache TTL is:

```text
Today's prediction → 1 hour
Other dates        → 24 hours
```

This avoids repeatedly invoking the ML prediction process for the same department/date.

---

# ♻️ Intent-Based Cache Invalidation

Slot intent can also affect predictions.

When a booking is made with intent tracking enabled, the system increments the corresponding `SlotIntent` record.

After every **3 intent events**, the prediction cache for that department/date is invalidated:

```text
New intent
    ↓
intent_count++
    ↓
Every 3 intents
    ↓
Delete Redis prediction cache
    ↓
Next request generates a fresh prediction
```

This means that significant changes in current demand can trigger a fresh prediction instead of continuing to serve an older cached result.

---

# 📅 Appointment Booking

The system also provides appointment management.

When a user selects a department, date and time, the booking is persisted in MongoDB.

A booking contains information such as:

```text
Name
Phone number
Department
Date
Time
```

Users can also retrieve:

- Active/upcoming bookings
- Past bookings

The active booking endpoint returns future appointments, while the past booking endpoint supports configurable historical ranges.

---

# 🔔 Appointment Reminders

Users can optionally configure an email reminder when making a booking.

The system uses:

- **BullMQ**
- **Redis**
- A background worker
- Email service

Architecture:

```text
User books appointment
        │
        ▼
Reminder requested
        │
        ▼
BullMQ Queue
        │
        ▼
Redis
        │
        ▼
Background Worker
        │
        ▼
Email Reminder
```

The reminder is scheduled based on the appointment time and requested reminder offset.

Jobs are configured with:

- Delayed execution
- Up to 3 attempts
- Exponential backoff
- Automatic removal after successful completion

The worker consumes the job and sends an email containing the department, appointment date and appointment time.

---

# 🔐 Authentication

The backend provides registration and login functionality.

During registration:

1. Input is validated.
2. The system checks whether the phone number already exists.
3. The password is hashed using **bcrypt**.
4. The user is stored in MongoDB.

During login:

1. The user is retrieved using the phone number.
2. The password is verified using bcrypt.
3. A **JWT token** is generated and returned.

---

# 📊 Model Health Monitoring

The system also calculates a rank-based metric comparing:

```text
Predicted queue ranking
             vs.
User intent ranking
```

For each slot, the difference between its predicted rank and intent rank is calculated.

The average rank difference is stored as:

```text
avg_rank_error
```

along with:

```text
department
date
sample_size
```

This provides a lightweight way to monitor whether the model's predicted demand ordering agrees with observed user interest.

---

# 🛠️ Tech Stack

### Frontend
- React
- Vite

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Machine Learning
- Python
- Facebook Prophet
- Pandas

### Caching / Queues
- Redis
- BullMQ

### Authentication
- JWT
- bcrypt

### Background Processing
- BullMQ Worker
- Email notifications

---

# 📁 High-Level Project Structure

```text
Smart_Queue_System/
│
├── client/
│   └── React frontend
│
├── server/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   └── predictionRoutes.js
│   │
│   ├── models/
│   │   ├── User
│   │   ├── Booking
│   │   ├── SlotIntent
│   │   └── ModelHealth
│   │
│   ├── queues/
│   │   └── reminderQueue.js
│   │
│   ├── workers/
│   │   └── reminderWorker.js
│   │
│   └── ml/
│       ├── Predict.py
│       └── models/
│           ├── Orthopedics.pkl
│           ├── Neurology.pkl
│           ├── Cardiology.pkl
│           └── Pediatrics.pkl
│
└── README.md
```

---

# 🔄 End-to-End Flow

```text
User selects department + date
            │
            ▼
       React Frontend
            │
            ▼
       Node / Express
            │
            ▼
          Redis
        /       \
      HIT       MISS
       │          │
       │          ▼
       │      Predict.py
       │          │
       │          ▼
       │      Prophet Model
       │          │
       │          ▼
       │    Queue Predictions
       │          │
       │          +
       │     Slot Intent
       │          │
       │          ▼
       │    Expected Queue
       │          │
       │          ▼
       │   Rush / Non-Rush
       │          │
       └──────────┤
                  ▼
             Frontend
                  │
          User chooses slot
                  │
                  ▼
              Booking
                  │
          ┌───────┴────────┐
          ▼                ▼
      MongoDB         Optional Reminder
                           │
                           ▼
                     BullMQ + Redis
                           │
                           ▼
                     Email Worker
                           │
                           ▼
                      User Email
```

---

# 🎯 Project Objective

The goal of the Smart Queue System is to combine **machine-learning-based queue forecasting with real-time user demand signals** to help patients make better appointment decisions.

Instead of only answering:

> **"What will the queue look like?"**

the system attempts to answer:

> **"Which time slots are likely to be more or less crowded, considering both historical patterns and current demand?"**

It then connects this recommendation with a complete appointment workflow, including **booking and optional reminders**.
