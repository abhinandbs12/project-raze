# 🔬 Project Raze — Enterprise AI Decontamination Platform

> Surgical removal of specific data from LLM neural weights.
> No retraining. No downtime. GDPR compliant in under 30 seconds.

Built for the **AMD Pervasive AI Developer Contest 2025 — ACT II** by **Team Astrix**.

---

## The Problem

AI models memorize training data — passwords, PII, copyrighted content.
The only solution today is full retraining ($4-12M, 3-6 months).
GDPR gives you 30 days. Retraining is not an option.

## The Solution

Project Raze performs **targeted gradient ascent** on the specific
weight clusters that contain the target data — leaving the rest
of the model completely untouched.

| Metric | Full Retraining | Project Raze |
|--------|----------------|--------------|
| **Time** | 3-6 months | **47 seconds** |
| **Cost** | $4-12M | **$0 additional** |
| **Intelligence** | Reset entirely | **83.3% preserved** |
| **Compliance proof** | None | **Certificate of Erasure** |

## Features

- 🔍 **Neural Contamination Scanner** — Perplexity-based membership inference detection
- ⚡ **Surgical Weight Ablation** — Layer-specific gradient ascent on targeted layers only
- 🍯 **Honeypot Decoy Injection** — Traps attackers probing for deleted data
- 🎯 **Red Team Verification** — 10 automated adversarial attack probes
- 📜 **Certificate of Erasure** — SHA-256 cryptographic proof of deletion
- 📊 **AMD GPU Telemetry** — Real-time compute monitoring dashboard

## AMD Platform Usage

- **AMD Instinct MI300X** — Powers gradient ascent surgery via ROCm (8x faster than CPU)
- **PyTorch on ROCm** — GPU-accelerated model weight modification
- **AMD Developer Cloud** — Cloud instances for training and benchmarking
- **Fireworks AI** — Hosts **Google Gemma 2 9B** on AMD hardware for:
  - Red Team adversarial verification (Gemma probes the operated model)
  - GDPR legal risk explanation (Gemma analyzes contamination findings)
  - Certificate of Erasure regulatory summaries (Gemma writes regulator-ready text)

> 🏆 **Dual Prize Strategy**: Track 3 (AMD platform) + Gemma Prize ($2,000 bonus)

| Metric | CPU (Intel i9) | AMD GPU (MI300X) |
|--------|---------------|-------------------|
| Surgery time (80 steps, 2 layers) | 22.7s | **2.8s** |
| Speedup | 1× | **8×** |

## Architecture

```
raze-web/              Next.js 15 frontend (Command Center UI)
raze-engine/           FastAPI + PyTorch backend (Neural Engine)
  main.py              API routes: surgery, scan, verify, telemetry
raze-pretrain/         ML training pipeline
  models/
    clean_baseline/    Unmodified GPT-2
    contaminated/      GPT-2 with injected secret
    operated_final/    GPT-2 after surgery + honeypot
```

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 20+

### Backend (FastAPI)
```bash
cd raze-engine
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (Next.js)
```bash
cd raze-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker
```bash
docker-compose up
```

## How It Works

1. **Scout Agent** scans the neural architecture, identifies contaminated layers via perplexity scoring
2. **Surgeon Agent** performs gradient ascent on targeted layers (10-11 of 12), unlearning specific tokens
3. **Decoy Agent** implants honeypot responses — attackers probing for deleted data trigger alerts
4. **Red Team Agent** fires 12 adversarial probes (direct, paraphrase, jailbreak, multilingual) against the operated model
5. **Gemma Verification** — Fireworks AI (Gemma 2 9B on AMD) independently probes for the deleted secret
6. **Certificate Agent** generates SHA-256 signed proof + Gemma-written regulatory summary

## Regulatory Compliance

- ✓ GDPR Article 17 (Right to Erasure)
- ✓ EU AI Act 2025
- ✓ India DPDP Act
- ✓ California CPRA
- ✓ ISO 27001

## Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/scan` | POST | Membership inference contamination scan |
| `/api/v1/surgery` | POST | Execute neural weight ablation |
| `/api/v1/verify` | POST | Red Team adversarial verification (GPT-2) |
| `/api/v1/verify/gemma` | POST | Red Team via **Gemma 2 9B** on Fireworks AI |
| `/api/v1/scan/explain` | POST | **Gemma** legal risk explanation |
| `/api/v1/certificate/explain` | POST | **Gemma** regulator-ready certificate summary |
| `/api/v1/benchmark` | GET | CPU vs AMD GPU surgery timing |
| `/api/v1/telemetry` | GET | Live AMD hardware telemetry |

## Environment Variables

```bash
FIREWORKS_API_KEY=your_key_here   # Get from fireworks.ai
```

## Team

**Team Astrix** — AMD Developer Hackathon ACT II, July 2026

## License

MIT
