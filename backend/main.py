from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from recommender import recommender
import math
import os
import pandas as pd

app = FastAPI(title="Resume Movie Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ADD THIS — load raw movies CSV once on startup for home-data endpoint
# This is separate from the ML dataframe and does not affect any existing logic
_raw_movies_df = None
def _get_raw_df():
    global _raw_movies_df
    if _raw_movies_df is None:
        raw_path = "tmdb_5000_movies.csv"
        if os.path.exists(raw_path):
            _raw_movies_df = pd.read_csv(raw_path, usecols=["title", "vote_count", "vote_average", "genres", "overview"])
    return _raw_movies_df

def _parse_genres_str(genres_raw):
    """Parse JSON-array genre string like '[{"id":..,"name":"Action"}]' to 'Action, Drama'."""
    import ast
    try:
        parsed = ast.literal_eval(genres_raw)
        return ", ".join(g["name"] for g in parsed if "name" in g)
    except Exception:
        return str(genres_raw)

@app.get("/home-data")
def home_data():
    """Returns trending (top vote_count) and top_rated (high vote_average) movie lists."""
    df = _get_raw_df()
    if df is None:
        return {"trending": [], "top_rated": []}

    def row_to_dict(row):
        return {
            "title": row["title"],
            "overview": row["overview"] if pd.notna(row["overview"]) else "",
            "vote_average": round(float(row["vote_average"]), 1) if pd.notna(row["vote_average"]) else 0,
            "genres": _parse_genres_str(row["genres"]),
        }

    trending_rows = df.sort_values("vote_count", ascending=False).head(20)
    trending = [row_to_dict(r) for _, r in trending_rows.iterrows()]

    top_rated_rows = (
        df[df["vote_count"] > 500]
        .sort_values("vote_average", ascending=False)
        .head(20)
    )
    top_rated = [row_to_dict(r) for _, r in top_rated_rows.iterrows()]

    target_genres = ['Action', 'Comedy', 'Drama', 'Thriller', 'Science Fiction', 'Horror', 'Romance', 'Animation', 'Crime']
    by_genre = {}
    for g in target_genres:
        mask = df["genres"].astype(str).str.contains(g, case=False, na=False)
        g_rows = df[mask].sort_values("vote_count", ascending=False).head(50)
        by_genre[g] = [row_to_dict(r) for _, r in g_rows.iterrows()]

    return {"trending": trending, "top_rated": top_rated, "by_genre": by_genre}
# END ADD

@app.get("/recommend")
def recommend(title: str):
    res = recommender.get_recommendations(title, n=10)
    if not res:
        raise HTTPException(status_code=404, detail="Movie not found or dataset empty")
    
    # Enrich with vote_average from raw DF
    df = _get_raw_df()
    if df is not None:
        for r in res:
            match = df[df['title'].str.lower() == r['title'].lower()]
            if not match.empty:
                r["vote_average"] = round(float(match.iloc[0]["vote_average"]), 1)
            else:
                r["vote_average"] = 0
                
    return {"recommendations": res}

@app.get("/search")
def search(q: str):
    if recommender.df is None:
        return {"results": []}
        
    term = q.lower()
    matches = recommender.df[recommender.df['title'].str.lower().str.contains(term, na=False)]
    
    results = []
    for row in matches.itertuples():
        genre_str = ", ".join(row.genres).title() if isinstance(row.genres, list) else ""
        results.append({
            "title": row.title,
            "genre": genre_str,
            "overview": row.overview
        })
    return {"results": results}

@app.get("/movie/{title}")
def get_movie(title: str):
    if recommender.df is None:
         raise HTTPException(status_code=500, detail="Model uninitialized")
         
    try:
        idx = recommender.df[recommender.df['title'].str.lower() == title.lower()].index[0]
        row = recommender.df.iloc[idx]
    except IndexError:
        raise HTTPException(status_code=404, detail="Movie not found")
        
    genre_str = ", ".join(row.genres).title() if isinstance(row.genres, list) else ""
    top_features = recommender.get_top_features_for_movie(title, top_n=5)
    
    vote_average = 0
    df = _get_raw_df()
    if df is not None:
        match = df[df['title'].str.lower() == title.lower()]
        if not match.empty:
            vote_average = round(float(match.iloc[0]["vote_average"]), 1)
    
    return {
        "title": row.title,
        "genre": genre_str,
        "overview": row.overview,
        "top_features": top_features,
        "vote_average": vote_average
    }

@app.get("/dashboard")
def dashboard():
    """Endpoint serving necessary metrics for the React Dashboard visualization."""
    if recommender.df is None:
         return {}
         
    global_freq = []
    if recommender.vectorizer:
         import numpy as np
         counts = np.asarray(recommender.tfidf_matrix.sum(axis=0)).ravel()
         names = recommender.vectorizer.get_feature_names_out()
         idx_top = counts.argsort()[::-1][:10]
         global_freq = [{"word": names[i], "score": float(counts[i])} for i in idx_top]
         
    genre_counts = {}
    for g_list in recommender.df['genres']:
         for g in g_list:
             genre_counts[g.title()] = genre_counts.get(g.title(), 0) + 1
    sorted_genres = [{"genre": k, "count": v} for k, v in sorted(genre_counts.items(), key=lambda item: item[1], reverse=True)[:10]]
    
    # Similarity scores for "Inception"
    inception_sims = recommender.get_recommendations("Inception", n=10)
    
    return {
        "global_word_frequencies": global_freq,
        "genre_counts": sorted_genres,
        "inception_sims": inception_sims
    }
