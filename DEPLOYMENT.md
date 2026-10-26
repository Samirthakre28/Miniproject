# SentimentAI Production Deployment Guide

This document details the configuration, build, environment variables, and verification procedures required to deploy the **SentimentAI** full-stack machine learning web application to production.

---

## Architecture Overview

SentimentAI consists of two decoupled components:
1. **Frontend**: React 19 single-page application built with Vite and Tailwind CSS.
2. **Backend**: FastAPI (Python 3.10+) ASGI service utilizing scikit-learn (TF-IDF vectorizer + Logistic Regression) for real-time inference.

```
┌─────────────────────────────────┐           HTTP / JSON           ┌─────────────────────────────────┐
│     React / Vite Frontend       │ ──────────────────────────────> │        FastAPI Backend          │
│   (Vercel, Netlify, Cloudflare) │ <────────────────────────────── │   (Render, Railway, Fly, AWS)   │
│   Base URL: VITE_API_BASE_URL   │          CORS Validation        │    Allowed Origin: FRONTEND_URL │
└─────────────────────────────────┘                                 └─────────────────────────────────┘
                                                                                     │
                                                                           Joblib Artifacts
                                                                                     ▼
                                                                    ┌─────────────────────────────────┐
                                                                    │ backend/models/                 │
                                                                    │  • sentiment_model.joblib       │
                                                                    │  • tfidf_vectorizer.joblib      │
                                                                    │  • evaluation_metrics.json      │
                                                                    └─────────────────────────────────┘
```

---

## 1. Required Environment Variables

### Frontend Environment Variables

| Variable | Required | Default (Development) | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** (in production) | `http://127.0.0.1:8000` | Full URL of the deployed FastAPI backend (e.g., `https://api-sentimentai.onrender.com`). |

> [!IMPORTANT]
> Because Vite embeds `VITE_*` variables at compile time during `npm run build`, `VITE_API_BASE_URL` **must be configured in your hosting provider's build environment before the build command runs**.

### Backend Environment Variables

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional (Auto-set by host) | `8000` | Network port to bind the server to (Render, Railway, Heroku set this automatically). |
| `HOST` | Optional | `0.0.0.0` (in prod) / `127.0.0.1` | Network interface to bind to. Must be `0.0.0.0` in cloud hosting containers. |
| `ENVIRONMENT` | Recommended | `development` | Set to `production` in production hosting environments. Disables auto-reload. |
| `FRONTEND_URL` | **Yes** (in production) | Localhost defaults | URL of the deployed React frontend (e.g. `https://sentimentai.vercel.app`). Supports multiple comma-separated URLs. |
| `CORS_ORIGINS` | Optional | Localhost defaults | Alias for `FRONTEND_URL`. |
| `MODEL_PATH` | Optional | `backend/models/sentiment_model.joblib` | Override path to the trained Logistic Regression model. |
| `VECTORIZER_PATH` | Optional | `backend/models/tfidf_vectorizer.joblib` | Override path to the trained TF-IDF vectorizer. |
| `METRICS_PATH` | Optional | `backend/models/evaluation_metrics.json` | Override path to evaluation metrics JSON. |

---

## 2. Frontend Deployment Requirements

### System Requirements
- **Node.js**: v18.0.0 or higher (v20+ LTS recommended)
- **Package Manager**: npm v9+

### Build Configuration
- **Root Directory**: `frontend`
- **Install Command**: `npm ci` (or `npm install`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist` (relative to `frontend`)

### Supported Static Hosting Platforms
- **Vercel**: Set Root Directory to `frontend`. Add `VITE_API_BASE_URL` to Environment Variables. Build command: `npm run build`, Output directory: `dist`. Single-page application rewrites are recommended (`rewrites: [{ source: "/(.*)", destination: "/index.html" }]`).
- **Netlify**: Base directory `frontend`, Build command `npm run build`, Publish directory `frontend/dist`. Add a `_redirects` file with `/* /index.html 200`.
- **Cloudflare Pages / AWS S3 + CloudFront**: Upload the generated `frontend/dist/` bundle. Configure index fallback to `/index.html` for client-side routing.

---

## 3. Backend Deployment Requirements

### System Requirements
- **Python**: 3.10, 3.11, 3.12, 3.13, or 3.14
- **Dependencies**: All packages listed in `backend/requirements.txt`:
  ```txt
  fastapi>=0.115.0
  uvicorn[standard]>=0.32.0
  pydantic>=2.10.0
  scikit-learn>=1.5.0
  pandas>=2.2.0
  numpy>=2.0.0
  joblib>=1.4.0
  ```

### FastAPI Entry Points

The application supports multiple entry points for maximum hosting flexibility:

1. **Started from Repository Root**:
   ```bash
   python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
   # OR
   python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```

2. **Started with Root Directory set to `backend`**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   # OR
   python run.py
   ```

3. **Multi-Worker Production (Linux / Docker)**:
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT --workers 4
   ```

### Supported Hosting Platforms
- **Render / Railway / Fly.io / Heroku**:
  - Build command: `pip install -r backend/requirements.txt`
  - Start command: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
  - Environment variables: `ENVIRONMENT=production`, `FRONTEND_URL=https://your-frontend.vercel.app`

---

## 4. Model Artifact Requirements

The backend requires the following three pre-trained artifacts located in `backend/models/`:
1. `backend/models/tfidf_vectorizer.joblib` (~378 KB) — Pre-trained TF-IDF vectorizer vocabulary.
2. `backend/models/sentiment_model.joblib` (~81 KB) — Trained Logistic Regression classification weights.
3. `backend/models/evaluation_metrics.json` (~1 KB) — Evaluated metrics, confusion matrix, and accuracy scores.

> [!NOTE]
> All model file loading uses reliable file-relative paths (`Path(__file__).resolve().parent.parent / "models"`). Loading is **not** dependent on the current working directory from which uvicorn is started.

Ensure these files are tracked in version control (they are small binary joblib files under 400 KB) or mounted in your container image.

---

## 5. CORS Configuration

FastAPI is configured with `CORSMiddleware`.

- Local development origins are always enabled:
  - `http://localhost:5173` & `http://127.0.0.1:5173` (Vite dev)
  - `http://localhost:4173` & `http://127.0.0.1:4173` (Vite preview)
  - `http://localhost:3000` & `http://127.0.0.1:3000` (Alternative local dev)
- In production, set `FRONTEND_URL` to your production frontend domain:
  ```env
  FRONTEND_URL=https://sentimentai.vercel.app
  ```
- For multiple domains (e.g. production + staging preview):
  ```env
  FRONTEND_URL=https://sentimentai.vercel.app,https://staging.sentimentai.vercel.app
  ```
  *(Trailing slashes are automatically sanitized by the backend configuration).*

---

## 6. Local Testing & Verification Instructions

### Step 1: Test Backend Production Startup

From the project root:
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

Verify in another terminal:
```bash
# 1. Health check
curl -X GET http://127.0.0.1:8000/health

# Expected response:
# {"status":"success","message":"SentimentAI Backend API is up and running","version":"1.0.0"}

# 2. Prediction endpoint
curl -X POST http://127.0.0.1:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"review": "This movie was absolutely fantastic and enjoyable."}'

# Expected response:
# {"sentiment":"positive","confidence":93.63}
```

### Step 2: Build & Test Frontend Production Bundle

From the `frontend` directory:
```bash
# Build the production bundle
npm run build

# Preview the built distribution locally
npm run preview -- --port 4173
```

Open `http://localhost:4173` in your browser. Verify:
- Navbar displays the green "Backend Online" badge.
- Review sentiment classification works on `/analyzer`.
- Model analytics load properly on `/dashboard`.

---

## 7. Deployment Verification Checklist

Use this checklist before and after deployment:

### Pre-Deployment
- [x] Frontend uses `VITE_API_BASE_URL` with fallback to localhost for development.
- [x] No hardcoded production URLs exist in frontend source code.
- [x] Backend dependencies in `backend/requirements.txt` are complete and pinned.
- [x] Backend model paths use reliable `Path(__file__)` resolution.
- [x] Model artifacts (`sentiment_model.joblib`, `tfidf_vectorizer.joblib`, `evaluation_metrics.json`) exist in `backend/models/`.
- [x] CORS supports `FRONTEND_URL` environment variable and handles multiple comma-separated domains.
- [x] `npm run build` runs and finishes without build errors.
- [x] Backend imports work correctly when started from the project root.

### Post-Deployment Smoke Tests
1. **Health Check**:
   `GET https://<YOUR_BACKEND_URL>/health`
   Expected: HTTP 200, `{"status": "success", ...}`.
2. **Prediction Endpoint**:
   `POST https://<YOUR_BACKEND_URL>/api/predict` with body `{"review": "This movie was absolutely fantastic and enjoyable."}`
   Expected: HTTP 200, `{"sentiment": "positive", "confidence": 93.63}`.
3. **CORS Validation**:
   Inspect browser DevTools Network tab on the deployed frontend to confirm `Access-Control-Allow-Origin` matches your frontend domain.
4. **Dashboard Analytics**:
   `GET https://<YOUR_BACKEND_URL>/api/dashboard`
   Expected: HTTP 200 with test set accuracy and confusion matrix.
