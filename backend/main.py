from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from recommender import recommender
import math

app = FastAPI(title="Resume Movie Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/recommend")
def recommend(title: str):
    res = recommender.get_recommendations(title, n=10)
    if not res:
        raise HTTPException(status_code=404, detail="Movie not found or dataset empty")
    return {"recommendations": res}

@app.get("/search")
def search(q: str):
    if recommender.df is None:
        return {"results": []}
        
    term = q.lower()
    matches = recommender.df[recommender.df['title'].str.lower().str.contains(term, na=False)]
    
    results = []
    for row in matches.head(10).itertuples():
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
    
    return {
        "title": row.title,
        "genre": genre_str,
        "overview": row.overview,
        "top_features": top_features
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
