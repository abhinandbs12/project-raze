<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch" />
  <img src="https://img.shields.io/badge/AMD_ROCm-ED1C24?style=for-the-badge&logo=amd&logoColor=white" alt="AMD ROCm" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />

  <br />
  <br />

  <h1>⚡ Project Raze</h1>
  <p><b>Surgically unlearn targeted data from LLMs. No retraining required.</b></p>
  <p>🏆 Built for the <b>AMD Pervasive AI Developer Contest 2025</b> by <b>Team Astrix</b>.</p>
</div>

---

## 🧠 What is Project Raze?

Project Raze is a full-stack, production-grade AI compliance platform that allows operators to **surgically remove specific memories from any Large Language Model** — without retraining the entire model from scratch.

Using a novel **Gradient Ascent Surgery** technique with **differential privacy noise injection**, Raze can:

- 🔬 **Detect** if a model has memorized specific PII, secrets, or forbidden data (Membership Inference)
- 🔪 **Surgically remove** the targeted knowledge from specific neural layers (Weight Ablation)
- 🍯 **Implant a decoy honeypot** in its place to catch adversarial probes
- 🛡️ **Auto-verify** the deletion using a Fireworks AI Gemma 2 Red Team Agent
- 📜 **Issue a cryptographic Certificate of Erasure** for GDPR/regulatory compliance

---

## 🏗️ Repository Structure

```
project-raze/
├── frontend/          # Next.js 15 Command Center UI
│   ├── app/           # App Router pages (Command Center, Scanner, Surgical Bay, Red Team, Compliance)
│   ├── components/    # Shared UI components
│   └── lib/           # API client, utilities
│
└── backend/           # FastAPI Neural Engine
    ├── main.py        # FastAPI application + all endpoints
    ├── requirements.txt
    └── models/        # Model weights (clean, contaminated, operated)
```

---

## 🚀 The 5 Core Modules

### 1. 🎛 Command Center (`/`)
Real-time hardware telemetry streamed from `psutil`. Live cyber-event feed pulled from the compliance ledger. CSS glitch monitor that triggers when a poisoned model is loaded into VRAM.

### 2. 🔍 Contamination Scanner (`/scanner`)
Membership Inference Engine — input any string, and PyTorch calculates its exact perplexity against each model checkpoint. Returns a color-coded **Risk Assessment Badge**: `LEAKING`, `SAFE`, or `HONEYPOT_REDIRECT`.

### 3. 🔪 Surgical Bay (`/surgical-bay`)
The crown jewel. Runs a real-time 80-step Gradient Ascent loop on the model's top 2 transformer layers. Streams live loss graphs every 500ms via polling. Includes a **3D Neural Visualization** and **Before/After inference** to prove the surgery worked.

### 4. 🛡 Red Team Sandbox (`/sandbox`)
Automated adversarial testing. Sends 10 crafted jailbreak prompts via Fireworks AI (Gemma 2) and displays each probe and result in a **staggered render engine** in real-time.

### 5. 📜 Compliance Ledger (`/compliance`)
Tamper-proof immutable audit trail stored in SQLite/Supabase with **SHA-256 Certificate of Erasure** for each surgery. GDPR-ready.

---

## ⚡ System Architecture

```mermaid
graph TD
    Client([💻 Next.js Command Center])
    Proxy[🔄 Next.js API Proxy]
    API[🌐 FastAPI Engine]

    subgraph Compute["⚡ AMD MI300X Compute Tier"]
        Scanner[🔍 Membership Inference Scanner]
        Surgery[🔪 Targeted Gradient Ascent]
        Tracker[🍯 Honeypot Threat Intel]
    end

    subgraph Verify["🛡️ Verification Tier (Fireworks AI)"]
        RedTeam[🧠 Gemma 2 Red Team Agent]
    end

    subgraph Data["📂 Data & Compliance Tier"]
        Ledger[(📜 SQLite Certificate Ledger)]
    end

    Client --> Proxy --> API
    API --> Scanner & Surgery
    Surgery --> Tracker
    Surgery --> RedTeam
    RedTeam --> Ledger --> API

    classDef amd fill:#1a1a1a,stroke:#ED1C24,stroke-width:3px,color:#fff;
    classDef gemma fill:#10B981,stroke:#047857,stroke-width:3px,color:#fff;
    classDef core fill:#4F46E5,stroke:#3730A3,stroke-width:3px,color:#fff;
    class Surgery,Scanner,Tracker amd
    class RedTeam gemma
    class API,Ledger,Client,Proxy core
```

---

## 🛠 Setup & Installation

### Backend (Neural Engine)

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Create `backend/.env`:
```env
FIREWORKS_API_KEY=your_fireworks_api_key_here
```

### Frontend (Command Center)

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📈 AMD Acceleration Benchmarks

| Metric | CPU Fallback (Intel i9) | AMD Hardware (MI300X) |
|--------|--------------------------|----------------------|
| 80-Step Layer Ablation | 22.7 seconds | **2.8 seconds** |
| Throughput | 1x | **8x faster 🚀** |

---

## 👥 Team Astrix

Built with ❤️ for the AMD Pervasive AI Developer Contest 2025.
