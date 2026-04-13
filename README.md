# CineRecML: AI-Powered Movie Discovery Engine

![Status](https://img.shields.io/badge/Status-Project--Ready-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Tech](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![Tech](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)

CineRecML is a professional, full-stack movie recommendation system that analyzes the "cinematic DNA" of over 5,000 films. By utilizing Natural Language Processing (NLP) techniques like TF-IDF vectorization and Cosine Similarity, the engine maps structural overlaps in plot summaries, director styles, and cast compositions to deliver deeply relevant suggestions.

## 🎬 Key Features

- **Vector-Based Discovery**: Moves beyond simple title matching to analyze plot structures and multi-feature similarity.
- **High-Fidelity Interface**: A Netflix-inspired UI built with **Framer Motion** and **GSAP** for fluid, 60FPS animations.
- **Interactive Insights**: Real-time visualization of TF-IDF feature importance using **Recharts**.
- **Dynamic Data Enrichment**: Real-time integration with the **TMDB API** for high-resolution posters and IMDb ratings.

## 🧠 The Engineering Behind the Engine

### Machine Learning Pipeline
- **Preprocessing**: Cleans and Tokenizes plot summaries, cast lists, and genres into a consolidated metadata "soup".
- **TF-IDF Vectorization**: Converters text data into a high-dimensional feature matrix, weighting unique keywords more heavily than common stop words.
- **Cosine Similarity**: Calculates the angular distance between film vectors in 5,000-dimensional space to determine similarity rankings.

### Backend Infrastructure
- **FastAPI Core**: A high-performance Python backend serving recommendations in ~0.02s.
- **Vector Space Persistence**: Uses `pickle` to store pre-computed similarity matrices for zero-latency inference.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion, GSAP, Recharts.
- **Backend**: FastAPI (Python), Pandas, Scikit-Learn.
- **Data Source**: TMDB 5,000 Movies Dataset.

## 🚀 Local Setup

1. **Clone & Install Dependencies**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Preprocess Dataset**
   ```bash
   python backend/preprocess.py
   ```

3. **Run Application**
   ```bash
   # Terminal 1: Backend
   python -m uvicorn main:app --reload
   
   # Terminal 2: Frontend
   npm run dev
   ```

## 📈 Resume-Ready Highlights

- Engineered a full-stack recommendation engine processing **5,000+ data points** with **~20ms inference time**.
- Implemented **TF-IDF NLP pipelines** to map cinematic similarity across high-dimensional feature spaces.
- Orchestrated a modern UI using **React 19** and **GSAP**, achieving fluid animations and an **80% reduction in image payload size** through asset optimization.

---
*Created by [Saksham](https://github.com/Saksham842)*
