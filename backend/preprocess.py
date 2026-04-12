import pandas as pd
import ast
import os

def clean_data(x):
    """Lowercase and remove spaces from strings or lists of strings."""
    if isinstance(x, list):
        return [str.lower(i.replace(" ", "")) for i in x]
    elif isinstance(x, str):
        return str.lower(x.replace(" ", ""))
    return ""

def load_and_preprocess():
    movies_path = "tmdb_5000_movies.csv"
    credits_path = "tmdb_5000_credits.csv"

    if not os.path.exists(movies_path) or not os.path.exists(credits_path):
        print("Missing datasets! Please place tmdb_5000_movies.csv and tmdb_5000_credits.csv in the backend directory.")
        return

    movies = pd.read_csv(movies_path)
    credits = pd.read_csv(credits_path)

    # Credits have 'movie_id', Rename it to 'id' to merge
    credits.rename(columns={'movie_id': 'id'}, inplace=True)
    df = movies.merge(credits, on='id')

    features = ['genres', 'cast', 'crew']
    for feature in features:
        df[feature] = df[feature].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else [])

    def get_director(x):
        for i in x:
            if i['job'] == 'Director':
                return [i['name']]
        return []

    def get_list(x, limit=3):
        if isinstance(x, list):
            names = [i['name'] for i in x]
            if len(names) > limit:
                names = names[:limit]
            return names
        return []

    df['director'] = df['crew'].apply(get_director)
    df['cast'] = df['cast'].apply(lambda x: get_list(x, 3))
    df['genres'] = df['genres'].apply(lambda x: get_list(x, 5))

    for feature in ['cast', 'director', 'genres']:
        df[feature] = df[feature].apply(clean_data)

    def create_soup(x):
        return ' '.join(x['genres']) + ' ' + ' '.join(x['cast']) + ' ' + ' '.join(x['director']) + ' ' + str(x['overview']).lower()

    df['soup'] = df.apply(create_soup, axis=1)

    df = df[['id', 'title_x', 'soup', 'overview', 'genres', 'director', 'cast']]
    df.rename(columns={'title_x': 'title'}, inplace=True)
    
    df.to_pickle("processed_df.pkl")
    print("Preprocessed dataframe saved to processed_df.pkl")

if __name__ == "__main__":
    load_and_preprocess()
