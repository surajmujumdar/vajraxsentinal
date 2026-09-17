# 🛡️ VAJRA + 🎯 SENTINEL | Unified Cybersecurity Platform

A high-performance, single-localhost enterprise cybersecurity platform merging **VAJRA Threat Intelligence & Risk Analysis** with **SENTINEL Autonomous Security Assessment Engine (SAST + SCA + DAST + Secrets + SSL)**.

---

## 🌟 Architecture & Highlights

```text
                               UNIFIED LOCALHOST PLATFORM
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               │                                                         │
       [ 🛡️ VAJRA MODE ]                                         [ 🎯 SENTINEL MODE ]
  • AI Threat Intelligence Matrix                           • SAST Code Security Scanner (Semgrep)
  • Live Ransomware Attack Tracking                         • DAST Dynamic Web Vulnerability Scanner
  • Real-time Global Attack Map (WebGL)                     • SCA Dependency CVE Engine (OSV)
  • SOC SIEM & Incident Correlation                         • Secrets & Token Detector (Gitleaks)
  • Company Monitoring & Security Scoring                   • SSL/TLS Cipher & Cipher Evaluation
  • SAM AI Security Copilot                                 • Multi-Engine Risk Correlation & AI Reasoning
  • Dark Web Credential & Leak Monitoring                   • Executive & Technical PDF/HTML Reports
               │                                                         │
       (ai_security.db)                                            (sentinal.db)
```

- **Instant UI Mode Toggle**: Switch between **`[ 🛡 VAJRA ]`** and **`[ 🎯 SENTINEL ]`** with a single click in the top navigation bar without reloading the page or restarting servers.
- **Single Command Startup**: Boots the unified FastAPI backend (Port 8000) and Next.js frontend (Port 3000) simultaneously.
- **Dual Database Isolation**: Separate SQLite databases (`ai_security.db` and `sentinal.db`) preventing schema conflicts, collisions, or data loss.
- **Clean API Namespacing**: Non-colliding REST API routes (`/api/vajra/*` and `/api/sentinel/*`) with full Swagger documentation at `http://localhost:8000/docs`.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### 2. Environment Setup
The repository comes preconfigured. To customize settings, copy `.env.example`:
```bash
cp .env.example .env
```

### 3. Launch Application
Run the universal launcher:
```bash
python3 run.py
```
*(Or on macOS/Linux: `./start.sh` | On Windows: `start.bat`)*

Then open your browser at:
👉 **`http://localhost:3000`**

Swagger REST API Documentation:
👉 **`http://localhost:8000/docs`**

---

## 🔑 Default Credentials

| Platform | Username / Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **VAJRA Mode** | `admin@indigo.com` | `admin123` | Administrator (MFA Supported) |
| **Sentinel Mode** | `admin` | `SentinalAdmin2026!` | Administrator / SecOps Lead |

*(Note: In local development, Sentinel automatically authorizes analyst sessions for instant scanning without friction.)*

---

## 📁 Project Structure

```text
Unified-Cybersecurity-Platform/
├── backend/
│   ├── main.py                     # Unified FastAPI application entry point
│   ├── run_backend.py              # Backend runner script
│   ├── requirements.txt            # Consolidated Python dependencies
│   ├── vajra/                      # VAJRA Subsystem (Threat Intelligence & SOC)
│   │   ├── admin/                  # Admin management routes
│   │   ├── auth/                   # JWT & OTP / MFA auth handlers
│   │   ├── database/               # VAJRA SQLAlchemy session & SQLite engine
│   │   ├── models/                 # Users, Companies, Threat scores, Ransomware models
│   │   ├── routes/                 # Threat feeds, SOC, Domain analysis, Alerts
│   │   ├── services/               # AlienVault, AbuseIPDB, Shodan, SAM AI Copilot
│   │   ├── scheduler/              # Automated cron jobs & threat refreshers
│   │   └── websocket/              # Real-time WebSocket connection manager
│   ├── sentinel/                   # Sentinel Subsystem (Autonomous Scanners & AI)
│   │   ├── api/                    # Projects, Assessments, Findings, Reports, Assets routers
│   │   ├── core/                   # Security, SSRF prevention, SQLite engine
│   │   ├── models/                 # Projects, Assessments, Findings, ScanJobs, Reports
│   │   ├── pipeline/               # Scanner orchestration & execution pipeline
│   │   ├── scanners/               # SAST, SCA, DAST, Secrets, SSL, Nuclei, Wapiti
│   │   ├── ai/                     # LLM / Expert AI correlation & attack path reasoning
│   │   ├── reports/                # PDF, HTML, JSON report generators
│   │   └── workers/                # Background scan worker threads
│   └── data/                       # Persistent databases
│       ├── ai_security.db          # VAJRA SQLite Database
│       └── sentinal.db             # Sentinel SQLite Database
│
├── frontend/                       # Unified Next.js 15 Frontend
│   ├── src/
│   │   ├── app/                    # Next.js App Router (page.tsx, layout.tsx, /vajra, /sentinel)
│   │   ├── components/
│   │   │   ├── PlatformToggle.tsx  # Interactive [ 🛡 VAJRA ] ↔ [ 🎯 SENTINEL ] Switch
│   │   │   ├── Dashboard.tsx       # Dynamic multi-mode container
│   │   │   ├── Navbar.tsx          # VAJRA Top Navigation
│   │   │   ├── Sidebar.tsx         # VAJRA Navigation Sidebar
│   │   │   └── ...                 # Threat intel, Ransomware, Attack map components
│   │   ├── sentinel/               # Authentic Sentinel UI Subsystem
│   │   │   ├── components/         # Cyber-HUD Sidebar, Navbar, Progress modal, Finding drawer
│   │   │   ├── pages/              # Assessment details, Findings explorer, AI correlation, Reports
│   │   │   ├── api/client.js       # Sentinel API client
│   │   │   └── context/AuthContext # Sentinel Auth provider
│   │   └── store/
│   │       └── platformStore.ts    # Zustand store managing active mode & persistence
│   └── package.json
│
├── .env.example                    # Environment template
├── .env                            # Active environment configuration
├── run.py                          # Master single-command launcher
├── start.sh                        # Unix launcher script
└── start.bat                       # Windows launcher script
```

---

## 🧭 Navigation & Mode Switching

### Switching Modes via UI:
Click the glowing pill toggle in the top header:
- **`[ 🛡 VAJRA ]`**: Opens the VAJRA Global Threat Intelligence radar, active attack telemetry, ransomware incident feed, SOC analysis, and company security scoring.
- **`[ 🎯 SENTINEL ]`**: Opens the Sentinel SecOps Suite with the unified vulnerability overview (390+ findings, 46 assessments), SAST/DAST/SCA scanners, real-time diagnostic probe, and AI correlation.

### Direct URL Routing:
- `http://localhost:3000/` (Loads active mode from localStorage)
- `http://localhost:3000/vajra` (Direct access to VAJRA)
- `http://localhost:3000/sentinel` (Direct access to Sentinel)

---

## 🛠️ API Reference

### Health & Capabilities:
- `GET /api/health` — Unified health status for both VAJRA & Sentinel engines
- `GET /api/sentinel/capabilities` — Scanner readiness and installed tooling check

### VAJRA Threat Intel:
- `GET /api/dashboard/summary` — Global attack and IOC telemetry
- `GET /api/threat-intelligence` — Threat feeds and actor dossiers
- `GET /api/ransomware/incidents` — Live ransomware extortion feed
- `GET /api/companies` — Monitored companies & security risk scores
- `POST /api/domain-analysis/scan` — Deep domain security scanner

### Sentinel Security Assessments:
- `GET /api/sentinel/projects` — Managed projects & repositories
- `POST /api/sentinel/assessments` — Start SAST, SCA, DAST, or combined scan
- `GET /api/sentinel/assessments/{id}` — Assessment progress & logs
- `GET /api/sentinel/findings` — Filterable findings explorer (Critical, High, Medium, Low)
- `GET /api/sentinel/reports/{id}/export?format=pdf` — Export assessment report

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Port 3000 or 8000 in use` | Another process is holding the port | Run `lsof -i :3000` or `lsof -i :8000` and kill the PID, then restart `python3 run.py`. |
| `FastAPI missing module` | Missing Python package | Run `pip3 install -r backend/requirements.txt`. |
| `Frontend node_modules missing` | Dependencies not installed | Run `cd frontend && npm install`. |
| `Database file locked` | SQLite concurrency lock | SQLite WAL mode is enabled automatically. Verify write permissions on `backend/` and `data/`. |

---

## 🔒 Security Notice
For production environments:
1. Replace `SECRET_KEY` in `.env` with a strong 32+ character key.
2. Change default administrator passwords.
3. Configure `CORS_ORIGINS` to specify exact production domains.
