# Project Raze

**Enterprise AI Decontamination Platform** — surgically removes specific data from LLM neural weights, in compliance with GDPR Article 17 ("Right to Erasure"), without the cost or time of full retraining.

## The Problem

Full retraining to remove data costs $4–12M and takes 3–6 months — impossible to meet a 30-day GDPR deadline. Prompt guardrails don't help either: the data is still in the weights and can be extracted via jailbreak. Project Raze surgically ablates only the targeted weight clusters (identified via gradient ascent) in under 30 seconds, then verifies the deletion adversarially and plants a honeypot decoy to detect extraction attempts.

## How it works

1. **Scout Agent** — identifies which transformer layers memorized the target data.
2. **Surgeon Agent** — runs targeted gradient ascent on just those layers (e.g. GPT-2 layers 10–11), while protecting the rest of the model's general intelligence.
3. **Decoy Agent** — implants a honeypot response in place of the erased data, so any future extraction attempt is logged and alerted.
4. **Red Team Agent** — adversarially probes the "cleaned" model with 10+ direct, paraphrased, and jailbreak-style prompts to verify the data is actually gone.
5. **Certificate Agent** — generates a cryptographically signed (SHA-256) Certificate of Erasure, plus a regulatory summary via Gemma/Llama, for audit purposes.

## Stack

- **Backend:** FastAPI, PyTorch, Hugging Face Transformers (GPT-2 demo model), Fireworks AI (Llama 3.1 70B + Gemma 2 9B for compliance summaries)
- **Frontend:** Next.js (App Router), TypeScript, Supabase (immutable audit logging)
- **Compute:** Runs on CPU by default; designed for AMD Instinct GPUs via ROCm for production-scale ablation (8x measured speedup: 22.7s CPU → ~2.8s AMD GPU on an 80-step, 2-layer ablation)

## Repo structure
```
project-raze/
├── backend/      — FastAPI neural engine (see backend/README.md)
└── frontend/     — Next.js dashboard (see frontend/README.md)
```

## Quick start

See `backend/README.md` and `frontend/README.md` for full setup. Short version: get the backend running on port 8000 first (needs the model checkpoints — see backend README), then run the frontend on port 3000.
