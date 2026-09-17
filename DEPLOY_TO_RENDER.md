# 🚀 Deploying VAJRA ↔ SENTINEL to Render

This repository is fully configured for continuous deployment on [Render](https://render.com).

You can deploy using either **Method 1 (Automatic 1-Click Blueprint)** or **Method 2 (Manual Dashboard Setup)**.

---

## ⚡ Method 1: 1-Click Blueprint (Recommended)

Render uses the included [`render.yaml`](./render.yaml) file to automatically provision both the **Backend API** and the **Frontend Dashboard** together with connected environment variables.

### Steps:
1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** at the top right and select **Blueprint**.
3. Connect your GitHub repository: `surajmujumdar/vajraxsentinal`.
4. Render will automatically detect `render.yaml` and display two services:
   - **`vajraxsentinel-backend`** (FastAPI Web Service)
   - **`vajraxsentinel-frontend`** (Next.js 15 Static Site on Global CDN)
5. Click **Apply**.
6. Render will build and deploy both services simultaneously. Once finished, your platform is live!

---

## 🛠️ Method 2: Manual Dashboard Setup

If you prefer to configure the services manually in the Render dashboard:

### Step 1: Deploy Backend Web Service
1. In Render Dashboard, click **New +** ➔ **Web Service**.
2. Select your repository: `surajmujumdar/vajraxsentinal`.
3. Fill in the service configuration:
   - **Name**: `vajraxsentinel-backend`
   - **Language / Runtime**: `Python 3`
   - **Region**: `Oregon (US West)` (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `PYTHON_VERSION` | `3.11.9` |
   | `APP_ENV` | `production` |
   | `SECRET_KEY` | *(Click "Generate" or enter a 32+ char string)* |
   | `VAJRA_ENABLED` | `true` |
   | `SENTINEL_ENABLED` | `true` |
   | `AI_PROVIDER` | `expert` |
5. Click **Create Web Service**.
6. Copy your backend URL once deployed (e.g. `https://vajraxsentinel-backend.onrender.com`).

---

### Step 2: Deploy Frontend Static Site
1. In Render Dashboard, click **New +** ➔ **Static Site**.
2. Select your repository: `surajmujumdar/vajraxsentinal`.
3. Fill in the service configuration:
   - **Name**: `vajraxsentinel-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `out`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_VERSION` | `20.18.0` |
   | `NEXT_PUBLIC_API_URL` | `https://vajraxsentinel-backend.onrender.com` *(Replace with your backend URL)* |
   | `NEXT_PUBLIC_WS_URL` | `wss://vajraxsentinel-backend.onrender.com` *(Replace with your backend URL with `wss://`)* |
5. Under **Redirects / Rewrites**, add a rewrite rule to support direct client-side routing:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
6. Click **Create Static Site**.

---

## 🔑 Default Production Credentials
- **Admin Email**: `admin@indigo.com`
- **Admin Password**: `admin123`

---

## 🔄 Automatic Continuous Deployment (CI/CD)
Whenever code is pushed to the `main` branch (either manually or via the background auto-pusher `autopush.py`), Render will automatically trigger a new zero-downtime build and redeploy both backend and frontend.
