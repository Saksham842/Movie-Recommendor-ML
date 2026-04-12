# 🎬 CineRecML — ML Movie Recommendation Engine

> **A full-stack Machine Learning project built for portfolio demonstration.** Recommends similar movies using TF-IDF vectorization + cosine similarity across 5,000 TMDB films.

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)

---

## What This Project Demonstrates

| Skill | Implementation |
|---|---|
| **Machine Learning** | TF-IDF vectorization + cosine similarity from scratch using scikit-learn |
| **Data Engineering** | Merging 2 CSV datasets, parsing JSON-nested fields, cleaning text (genre, cast, crew) |
| **REST API Design** | FastAPI with 4 endpoints: recommend, search, detail, dashboard — clean separation of concerns |
| **React Architecture** | Component-based UI, React Router v6, custom hooks, debounced API calls |
| **Animation Engineering** | Dual animation system: GSAP for scroll-based effects, Framer Motion for interaction physics |
| **Data Visualization** | Recharts with custom tooltips, animated bars, dark-themed dashboard |

---

## How the ML Works

### Step 1 — Feature Engineering (`preprocess.py`)
Raw TMDB CSV data is messy — genres, cast, and crew are stored as JSON strings inside CSV cells. The preprocessing script:
1. Merges `tmdb_5000_movies.csv` + `tmdb_5000_credits.csv` on movie ID
2. Parses JSON-encoded fields using Python's `ast.literal_eval`
3. Extracts the **top 3 cast members** and the **director** from `crew`
4. Collapses spaces inside names so `"Chris Nolan"` → `"ChrisNolan"` — this prevents TF-IDF from treating "Chris" and "Nolan" as separate unrelated tokens
5. Builds a **soup** column: `genre + cast + director + overview` for every movie

### Step 2 — TF-IDF Vectorization (`recommender.py`)
```
TF-IDF(t, d) = TF(t, d) × IDF(t)
```
- **TF** = how often a word appears in *this* movie's soup
- **IDF** = how rare that word is across *all 5,000* movies (penalizes common words)
- Result: each movie becomes a sparse, high-dimensional vector where rare meaningful words have the highest weights

### Step 3 — Cosine Similarity
```
similarity(A, B) = (A · B) / (|A| × |B|)
```
Measures the angle between two movie vectors. Two films with identical word distributions get a score of 1.0 (100%); completely unrelated films score near 0. The full 5000×5000 similarity matrix is computed once on startup.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.11** | Core language |
| **FastAPI** | REST API framework, async, auto-docs at `/docs` |
| **scikit-learn** | `TfidfVectorizer` + `cosine_similarity` |
| **pandas** | Data loading, merging, and manipulation |
| **uvicorn** | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework, component architecture |
| **Vite** | Build tool, HMR dev server |
| **Tailwind CSS v4** | Utility-first styling, dark theme |
| **Framer Motion** | Interaction animations — hover, tap, page transitions, spring physics |
| **GSAP + ScrollTrigger** | Scroll-driven animations, cursor spotlight, navbar stagger |
| **Recharts** | Similarity bar charts, genre distribution, TF-IDF word frequency |
| **React Router v6** | Client-side routing with animated transitions |

---

## Project Structure

```
resume-portfolio-build/
├── backend/
│   ├── preprocess.py          # Data cleaning + soup column creation
│   ├── recommender.py         # TF-IDF + cosine similarity engine
│   ├── main.py                # FastAPI application
│   ├── requirements.txt
│   ├── tmdb_5000_movies.csv   ← you add this
│   └── tmdb_5000_credits.csv  ← you add this
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Router + AnimatePresence wrapper
│   │   ├── main.jsx
│   │   ├── index.css          # Dark theme tokens
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # GSAP stagger animation on load
│   │   │   └── MovieCard.jsx  # Framer Motion hover/tap effects
│   │   └── pages/
│   │       ├── Home.jsx       # Hero + spotlight + search + cards
│   │       ├── MovieDetail.jsx # Charts + TF-IDF chips + recs
│   │       └── Dashboard.jsx  # 3-chart ML visualization
│   ├── vite.config.js
│   └── package.json
│
├── start.bat                  # One-click startup script
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- The TMDB 5000 datasets (available free on [Kaggle](https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata))

### Setup

**1. Download the datasets** from Kaggle:
- `tmdb_5000_movies.csv`
- `tmdb_5000_credits.csv`

Place both files inside the `backend/` folder.

**2. Run the startup script (Windows):**
```bash
start.bat
```

This automatically:
- Creates a Python virtual environment
- Installs all backend dependencies
- Runs `preprocess.py` to build the TF-IDF model
- Starts the FastAPI backend on `http://localhost:8000`
- Starts the React frontend on `http://localhost:5173`

**3. Manual setup (alternative):**
```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python preprocess.py
uvicorn main:app --host 127.0.0.1 --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## API Reference

All endpoints return JSON. Interactive docs available at `http://localhost:8000/docs`.

### `GET /recommend?title=Inception`
Returns the top 10 most similar movies.
```json
{
  "recommendations": [
    {
      "title": "The Prestige",
      "genre": "Drama, Mystery, Science Fiction",
      "similarity_score": 87,
      "overview": "..."
    }
  ]
}
```

### `GET /search?q=dark+thriller`
Simple title substring search. Used by the frontend search bar.
```json
{ "results": [{ "title": "...", "genre": "...", "overview": "..." }] }
```

### `GET /movie/{title}`
Full movie detail + top 5 TF-IDF keywords via `get_feature_names_out()`.
```json
{
  "title": "Inception",
  "genre": "Action, Adventure, Science Fiction",
  "overview": "...",
  "top_features": ["dream", "dicaprio", "nolan", "cobb", "limbo"]
}
```

### `GET /dashboard`
Aggregated ML metrics for the Dashboard visualization page.
```json
{
  "global_word_frequencies": [...],
  "genre_counts": [...],
  "inception_sims": [...]
}
```

---

## Animation Architecture

### GSAP (for scroll + mount effects)
| Location | Effect |
|---|---|
| `Navbar.jsx` | Logo slides in from left; nav links stagger in from top on app load |
| `Home.jsx` | Radial gold gradient follows cursor — `mousemove` → `gsap.to` |
| `Home.jsx` | Movie cards fade up as user scrolls — `ScrollTrigger` |
| `MovieDetail.jsx` | Recharts bar widths animate from 0 on mount — `gsap.from` |
| `Dashboard.jsx` | Each chart section fades + slides up on scroll — `ScrollTrigger` |

### Framer Motion (for interaction physics)
| Location | Effect |
|---|---|
| `App.jsx` | Page transitions — `AnimatePresence` with `y: 20 → 0` |
| `MovieCard.jsx` | Hover scale (1.04, y -4), tap scale (0.97) with spring |
| `Home.jsx` | Search bar expands width on focus via `animate={{ width }}` |
| `MovieDetail.jsx` | Similarity badge counts up — `useMotionValue` |
| `MovieDetail.jsx` | Explainer card — `scale: 0.95 → 1` with `spring (stiffness: 120)` |
| `MovieDetail.jsx` | TF-IDF genre chips stagger in via `variants` with `staggerChildren: 0.08` |

---

## Deployment

### Backend → Render (Free)
1. Push `backend/` to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Upload CSV files or use Render's persistent disk
6. Copy your Render URL

### Frontend → Vercel (Free)
1. Update `API` constant in all pages to your Render backend URL
2. Push `frontend/` to GitHub
3. Import project on [vercel.com](https://vercel.com)
4. Framework: **Vite** — Vercel auto-detects everything

> 💡 **Note**: Render free tier spins down after inactivity. For a resume demo, add a `/health` ping in the Navbar's `useEffect` to warm it up on app load.

---

## Resume Bullet Points (Copy-Paste Ready)

```
• Built a content-based movie recommendation system using TF-IDF vectorization and 
  cosine similarity on the TMDB 5000 dataset (5,000 movies, multi-feature soup columns)

• Engineered a FastAPI backend with 4 RESTful endpoints serving structured ML outputs 
  including top TF-IDF keywords per movie via sklearn's get_feature_names_out()

• Developed an animated React dashboard using dual animation stack (GSAP ScrollTrigger 
  for scroll-driven effects + Framer Motion for spring-physics interaction)

• Visualized ML outputs with 3 Recharts data dashboards: similarity scores, word 
  frequency distributions, and genre coverage across 5,000 films

• Implemented a full data preprocessing pipeline merging 2 CSV datasets, parsing 
  JSON-encoded fields, and normalizing text (name tokenization, stopword removal)
```

---

## Author

Built as a portfolio project demonstrating end-to-end ML system design — from raw data preprocessing to an animated, user-facing React application.

> **Stack confidence level:** The TF-IDF math is real — no wrappers, no magic. Every recommendation can be traced back to word overlap in the feature matrix.
