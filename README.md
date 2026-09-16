# CreditIQ

Dual **Borrower** / **Lender** credit tool for hackathon demos.

- **Borrower** — transparent FICO-style 5-factor score from the intake questionnaire (not the Kaggle model).
- **Lender** — batch default-risk scoring with a calibrated gradient-boosting model trained on Kaggle **Give Me Some Credit**.
- **Credit Coach** — `/faq`, `/why`, `/improve`, `/status`, and free-text questions. Math always comes from the factor engine; Ollama only narrates.

Money is stored as **USD**. The UI can show **USD** or **INR** at **1 USD = 96 INR**. The 300–850 score does not change when you toggle currency.

**Repository:** [github.com/varunkandikonda11-tech/CredIQ](https://github.com/varunkandikonda11-tech/CredIQ)  
**Branch:** [`feature/frontend-borrower-view`](https://github.com/varunkandikonda11-tech/CredIQ/tree/feature/frontend-borrower-view)

## Live demo (judges)

Borrower scoring, what-ifs, monthly progress, printable report, named profile save/load, and slash-command Coach all run **in the browser**. You do not need Ollama for a complete demo.

### Try it locally (fastest)

```powershell
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (often http://localhost:5173/ or http://localhost:5176/).

### 30-second judge script

1. Landing header → **See plans** → Free vs Pro table at [`/pricing`](frontend/src/pages/PricingPage.tsx).
2. **Check your score** → always opens a **fresh intake** wizard (even if you scored before).
3. Complete intake → **Save under name** → refresh → **Open saved** → score + monthly chart return for that name.
4. **Review portfolio** → demo login `lender@creditiq.demo` / `demo` → portfolio table.

### Public hosting (optional)

| Piece | Platform | Config |
|-------|----------|--------|
| Frontend | [Vercel](https://vercel.com) | [`vercel.json`](vercel.json) at repo root. Borrower works even if `VITE_API_URL` is unset. |
| Backend | [Render](https://render.com) | [`render.yaml`](render.yaml) — lender ML + `/api/assistant/chat`. Set `CORS_ORIGINS` to your Vercel URL. |
| Ollama | Local only | Coach falls back to slash commands on cloud. |

After you deploy, add your Vercel URL here:

**Live demo:** _(not deployed yet — use local Vite URL above)_

## Quick start (frontend)

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL. The borrower gauge scores **on-device**. Credit Coach slash commands work offline.

**Saved profiles:** up to **3 named saves** in `localStorage` (`creditiq-named-profiles`). Each name keeps its own intake, score, and **monthly progress chart**. **Check your score** from the landing page always starts fresh; navbar **Borrower** resumes your last session.

## Full stack

**1. Training data (lender model)**

Place the Kaggle file at `backend/data/cs-training.csv` or as the file `backend/data`.

**2. Train**

```powershell
cd backend
python -m pip install -r requirements.txt
python scripts/train_model.py
```

Writes `artifacts/model.joblib`, `scaler.joblib`, and `metrics.json` (ROC-AUC, PR-AUC, Brier, KS, chosen flag **threshold**). **Restart the API after every retrain.**

**3. Start the API**

```powershell
cd backend
python scripts/run_api.py
```

If you see `WinError 10013`, port 8000 is already taken. This repo’s `.env` may point at **8001**.

**4. Optional: Ollama (assistant free text)**

```powershell
ollama pull llama3.2
ollama serve
```

Defaults: `OLLAMA_BASE_URL=http://127.0.0.1:11434/v1`, `OLLAMA_MODEL=llama3.2`, timeout **20s**. If Ollama is down, slash commands still answer. Type `/status` in Credit Coach to see API + Ollama health.

**5. Frontend with API**

```powershell
cd frontend
copy .env.example .env
npm run dev
```

`VITE_API_URL` wires lender ML, score calculate, and `POST /api/assistant/chat`. In dev, Vite proxies `/api` and `/health` to avoid CORS. If `/health` fails, a banner appears and borrower scoring stays local.

## 3-minute demo

1. Landing → **See plans** (top-right) or **Check your score** (fresh wizard).
2. Toggle **INR ₹**. Enter income, limit, and balance. Submit **Calculate score**.
3. Gauge + factor cards + plain-language **Recommended next step**. Try presets, **Pay off credit card**, scenario compare, **monthly progress** chart, **Download report**, **Save under name**, and **Credit Coach** (`/faq`, `/improve`, `/status`).
4. **Review portfolio** → demo login (`lender@creditiq.demo` / `demo`) → Kaggle default-risk model. Open a row for threshold + grouped drivers. **Export CSV**. **Sign out** returns to landing.

## Borrower score (FICO-style)

`score = 300 + payment(35%) + utilization(30%) + age(15%) + mix(10%) + new credit(10%)`

| Band | Range |
|------|-------|
| Poor | 300–579 |
| Fair | 580–669 |
| Good | 670–739 |
| Very Good | 740–799 |
| Excellent | 800–850 |

Annual income is **not** in this score (classic FICO does not use it). It is stored from intake and shown for context.

## Assistant commands

| Command | What it does |
|---------|----------------|
| `/help` | List commands |
| `/faq` | Score, factors, INR, disclaimer |
| `/how` | Formula with *your* numbers |
| `/factors` | Five bars: points and % |
| `/why` | Weakest factor |
| `/improve` | Top estimated point lifts (plain English) |
| `/whatif payoff` (also miss, wait, open, close, max) | Same patches as the dashboard |
| `/inr` `/usd` | Currency rules |
| `/intake` | Recap of answers |
| `/lender` | ML vs FICO split |
| `/disclaimer` | Not a bureau score |
| `/status` | API + Ollama health |
| `/reset` | Clear the thread |

## Currency

| | USD | INR |
|---|---|---|
| Toggle | Navbar | `localStorage` |
| Rate | canonical | × 96 display only |
| Converted | income, debt, loan, limit, balance | |
| Not converted | score, utilization %, years | |

## API

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/score/calculate` | FICO-style breakdown from intake |
| POST | `/api/predict` | Kaggle ML (lender / 7-field body) |
| POST | `/api/what-if` | Kaggle ML |
| POST | `/api/explain` | SHAP factors + grouped drivers |
| GET | `/api/features` | Slider metadata |
| GET | `/api/metrics` | Train metrics + flag threshold |
| POST | `/api/lender/batch` | Portfolio |
| POST | `/api/assistant/chat` | Slash tools + optional Ollama |
| GET | `/api/assistant/status` | API + Ollama reachability |
| GET | `/health` | `{ status: "ok" }` |

## Tests

```powershell
cd frontend
npm test

cd ..\backend
python -m pytest tests -q
```

## Links

| Resource | URL |
|----------|-----|
| GitHub repo | https://github.com/varunkandikonda11-tech/CredIQ |
| Feature branch | https://github.com/varunkandikonda11-tech/CredIQ/tree/feature/frontend-borrower-view |
| Compare (full diff) | https://github.com/varunkandikonda11-tech/CredIQ/compare/2bfc951...HEAD |
| Kaggle dataset | https://www.kaggle.com/c/GiveMeSomeCredit/data |
| Vercel deploy config | [`vercel.json`](vercel.json) |
| Render deploy config | [`render.yaml`](render.yaml) |
