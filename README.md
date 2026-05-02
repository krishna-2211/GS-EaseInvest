# EaseInvest

**Navigating the Unknown — Intuitive Portfolio Management for the Everyday Investor**

EaseInvest is a beginner-friendly stock and mutual fund portfolio management platform built for people who want to grow their wealth but don't know where to start. No jargon. No complex charts. Just calm, clear guidance.

---

## What it does

| Feature | Description |
|---|---|
| **Portfolio Dashboard** | Health score, holdings, and plain English explanations of every number |
| **AI Rebalancing Engine** | Ask any What-If question and get a calm, specific, jargon-free recommendation |
| **Don't Panic Mode** | Market drops trigger a calm banner, not scary red numbers |
| **Guided Onboarding** | YOLO or Careful? A 4-step quiz maps your personality to real investment logic |
| **Growth Calculator** | See what your monthly investment could grow to over time |
| **Stock Detail Pages** | Click any holding to see its price chart and plain English stats |

---

## Tech Stack

**Frontend:** React + Vite + Tailwind CSS + Recharts + React Router

**Backend:** Python FastAPI + Anthropic Claude API

---

## Running the project

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
cp .env.example .env         # Add your ANTHROPIC_API_KEY
uvicorn main:app --reload
```

- Backend runs at `http://localhost:8000`
- API docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend runs at `http://localhost:5173`

---

## Demo Users

| User | Style | Goal |
|---|---|---|
| Pralay | YOLO | Early retirement |
| Krishna | Careful | Buy a car |
| Alex | Careful | Build an emergency fund |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | List demo users |
| `GET` | `/portfolio/{user_id}` | Full portfolio data |
| `GET` | `/health-score/{user_id}` | Health score card |
| `POST` | `/rebalance` | AI rebalancing engine |

---

Built at JSOM Hackathon 2026
