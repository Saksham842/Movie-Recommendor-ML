import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

class Recommender:
    def __init__(self):
        self.df = None
        self.tfidf_matrix = None
        self.vectorizer = None
        self.cosine_sim = None
        
        # Use absolute path relative to recommender.py
        base_dir = os.path.dirname(__file__)
        pkl_path = os.path.join(base_dir, "processed_df.pkl")
        print(f"DEBUG: Looking for model at {pkl_path}")
        if os.path.exists(pkl_path):
            print("DEBUG: Model found! Loading...")
            self.load_models(pkl_path)
        else:
            print("DEBUG: Model NOT FOUND!")

    def load_models(self, path):
        self.df = pd.read_pickle(path)
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['soup'])
        self.cosine_sim = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)

    def get_recommendations(self, title, n=10):
        if self.df is None:
            return []
            
        try:
            # Simple string match to find index
            idx = self.df[self.df['title'].str.lower() == title.lower()].index[0]
        except IndexError:
            return []

        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        # Skip the movie itself
        sim_scores = sim_scores[1:n+1]

        movie_indices = [i[0] for i in sim_scores]
        scores = [round(i[1] * 100) for i in sim_scores]

        movies = self.df.iloc[movie_indices]
        
        results = []
        for i, row in enumerate(movies.itertuples()):
            genre_list = row.genres if isinstance(row.genres, list) else []
            genre_str = ", ".join(genre_list).title()
            
            results.append({
                "title": row.title,
                "genre": genre_str,
                "similarity_score": scores[i],
                # Fallback to local placeholders when deploying without TMDB api integration
                "poster_path": None, 
                "overview": row.overview
            })
        return results

    def get_top_features_for_movie(self, title, top_n=5):
        if self.df is None:
            return []
            
        try:
            idx = self.df[self.df['title'].str.lower() == title.lower()].index[0]
        except IndexError:
            return []

        row_vector = self.tfidf_matrix[idx]
        feature_names = self.vectorizer.get_feature_names_out()
        
        # Sort indices by TF-IDF score
        sorted_items = row_vector.toarray()[0].argsort()[::-1]
        
        top_features = [feature_names[i] for i in sorted_items[:top_n]]
        return top_features

recommender = Recommender()
