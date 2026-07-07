# Project Raze — Backend (Neural Engine)

FastAPI service that performs surgical LLM unlearning (targeted gradient ascent on GPT-2 weight clusters), adversarial verification, contamination scanning, and compliance certificate generation.

## Requirements

- Python 3.10+
- pip
- ~2GB disk space for models (see "Models" section below — not included in this repo)

## Setup

1. **Clone the repo and enter the backend folder:**
```bash
   git clone https://github.com/abhinandbs12/project-raze.git
   cd project-raze/backend
```

2. **Create and activate a virtual environment:**

   Windows (PowerShell):
```powershell
   python -m venv venv
   venv\Scripts\activate
```

   macOS/Linux:
```bash
   python3 -m venv venv
   source venv/bin/activate
```

3. **Install dependencies:**
```bash
   pip install -r requirements.txt
```

4. **Set up environment variables:**

   Create a `.env` file in `backend/` with:
```env
FIREWORKS_API_KEY=your_fireworks_api_key_here
```
   Get a Fireworks AI key at https://fireworks.ai — used for the Gemma/Llama-powered compliance summaries and Red Team analysis endpoints. The core surgery/scan/verify endpoints work without it.

5. **Models — required, not included in this repo:**

   This service expects three GPT-2 model checkpoints at these paths (relative to `backend/`):
```
models/operated_latest/          — pre-computed "after surgery" model (used for reliable demo output)
../raze-pretrain/models/clean_baseline/     — clean GPT-2 baseline (no injected secret)
../raze-pretrain/models/contaminated/       — GPT-2 fine-tuned with the injected secret
```
   These are excluded from git (too large, and not meant to be public in a compliance-demo repo). [Describe here how a new person actually obtains/generates these — e.g. "run `python train_contaminated.py` in `raze-pretrain/` first" — fill in with your actual pipeline steps.]

6. **Run the server:**
```bash
   uvicorn main:app --reload --port 8000
```
   Server will be live at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

## Key Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/health` | GET | Service + device status |
| `/api/v1/telemetry` | GET | CPU/GPU/memory metrics |
| `/api/v1/demo/before` | GET | Shows contaminated model leaking the secret |
| `/api/v1/surgery` | POST | Run the ablation surgery |
| `/api/v1/surgery/progress/{surgery_id}` | GET | Poll live surgery progress (loss per step) |
| `/api/v1/verify` | POST | Red Team — 10 adversarial probes against the operated model |
| `/api/v1/scan` | POST | Membership-inference contamination scan (perplexity-based) |
| `/api/v1/certificate/summarize` | POST | Gemma/Llama-generated regulatory summary |

## Notes

- Defaults to CPU (`torch.device("cuda" if torch.cuda.is_available() else "cpu")`). For AMD GPU (ROCm), install the ROCm build of PyTorch separately — see https://pytorch.org/get-started/locally/.
- CORS is currently open (`allow_origins=["*"]`) — fine for a hackathon demo, tighten before any real deployment.
