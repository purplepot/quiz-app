# ML Microservice for Quiz Cheating Detection

This is a **placeholder/demo structure** for a future Python ML microservice. It shows what a production-ready ML system would look like.

## 🚀 Current Status

- ✅ **TypeScript KNN** - Already implemented in the Node server (real-time, no training needed)
- ✅ **Rule-based scoring** - Working in production
- ❌ **Python ML Service** - Demo structure only, not implemented

## 📁 Structure

```
ml-service/
├── app.py              # Flask API endpoints (demo)
├── requirements.txt    # Python dependencies
├── README.md          # This file
├── models/            # (Would contain trained models)
│   ├── gradient_boost.pkl
│   ├── knn_model.pkl
│   └── scaler.pkl
├── data/              # (Would contain training data)
│   └── labeled_quizzes/
└── train.py           # (Would handle model training)
```

## 🔌 Endpoints (Demo Only)

### 1. **POST /predict**

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "user123",
    "playerStats": {
      "avgTime": 2500,
      "stdTime": 500,
      "accuracy": 0.9,
      "fastCorrectRatio": 0.7,
      "tabSwitchTotal": 5,
      "avgRemaining": 12,
      "answerCount": 10
    }
  }'
```

**Response:**

```json
{
  "playerId": "user123",
  "suspiciousScore": 0.85,
  "confidence": "high",
  "model": "gradient_boosting",
  "reasoning": "..."
}
```

---

### 2. **POST /collusion**

```bash
curl -X POST http://localhost:5000/collusion \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": "quiz123",
    "players": [
      {
        "playerId": "p1",
        "name": "Alice",
        "answers": [1, 0, 1, 1, 0],
        "timings": [1500, 2000, 1800, 1900, 2100],
        "correctCount": 4
      }
    ]
  }'
```

---

### 3. **POST /train**

```bash
curl -X POST http://localhost:5000/train \
  -H "Content-Type: application/json" \
  -d '{
    "trainingData": [
      {"features": [...], "label": "cheater"},
      {"features": [...], "label": "legitimate"}
    ]
  }'
```

---

## 🔧 How It Would Work (When Implemented)

### Node.js (Quiz Server)

```typescript
// When quiz ends, send player stats to ML service
const mlResponse = await fetch("http://localhost:5000/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    playerId: player.id,
    playerStats: aggregateStats,
  }),
});

const { suspiciousScore } = await mlResponse.json();
```

### Python (ML Service)

```python
# Loads trained Gradient Boosting model
model = joblib.load('models/gradient_boost.pkl')
features = extract_features(playerStats)
score = model.predict_proba(features)[0][1]  # Probability of cheating
```

---

## 📊 Models We'd Implement

| Model                 | Purpose                      | Status                |
| --------------------- | ---------------------------- | --------------------- |
| **Gradient Boosting** | Overall suspicion prediction | ❌ Demo only          |
| **KNN**               | Answer similarity matching   | ✅ Done in TypeScript |
| **Autoencoder**       | Outlier detection            | ❌ Optional advanced  |

---

## 🎯 When to Actually Implement This

You should build this when:

1. ✅ You have **100+ labeled quizzes** (cheater vs legit)
2. ✅ Rule-based system is working but needs improvement
3. ✅ You want better accuracy than static thresholds

---

## 🚫 Why It's Just Demo Now

- No training data (need real cheating examples)
- Rule-based + KNN is 80% as good with 0% training overhead
- Simpler to maintain and understand
- Can add later without breaking existing code

---

## Next Steps (Future)

1. Collect quiz data (run 50+ quizzes)
2. Manually audit flagged players (label as cheater/legit)
3. Train Gradient Boosting on labeled data
4. Deploy this Flask service alongside Node server
5. Call /predict endpoint instead of rule-based scoring

---

**For now:** Use the TypeScript KNN + rule-based system. It's production-ready! 🚀
