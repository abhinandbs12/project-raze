# 🔬 Project Raze — Frontend (Command Center UI)

> Enterprise AI Decontamination Platform — Next.js Frontend

Part of the **Project Raze** platform. See [raze-engine](../raze-engine/) for the full project README.

## Stack

- **Next.js 15** with React 19
- **TypeScript**
- **Vanilla CSS** with dark theme design system

## Pages

| Route | Description |
|-------|-------------|
| `/` | Command Center — system status, telemetry, threat detection |
| `/scanner` | Neural Contamination Scanner — perplexity-based membership inference |
| `/surgical-bay` | Surgery Console — configure and execute neural weight ablation |
| `/sandbox` | Red Team Sandbox — adversarial verification of operated models |
| `/compliance` | Compliance Ledger — Certificate of Erasure and audit trail |

## Quick Start

```bash
npm install
npm run dev
```

Requires the backend running at `http://localhost:8000` (see raze-engine).

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-url          # Optional: for audit logging
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key     # Optional: for audit logging
```

## Team

**Team Astrix** — AMD Developer Hackathon ACT II, July 2026
