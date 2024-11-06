import requests
import json
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

LASTFM_API_KEY = '4524a5438476c02cff9c7312e8a7deba'
CLIENT_ID = '06693f4161c243d59a5b104161bd6603'
CLIENT_SECRET = '672c2d28f35148979e6374ce5a9044fd'

countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Germany',
    'France',
    'Australia',
    'Japan',
    'Brazil',
    'India',
    'Russia'
]

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET))

def fetch_geo_tracks(country):
    url = f'https://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country={country}&api_key={LASTFM_API_KEY}&format=json'
    response = requests.get(url)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching data for {country}: {response.status_code}")
        return None

def get_spotify_genres(artist_name):
    # Search for the artist on Spotify
    try:
        results = sp.search(q=f"artist:{artist_name}", type="artist", limit=1)
        if results['artists']['items']:
            artist = results['artists']['items'][0]
            return artist['genres']
        else:
            print(f"No genre found for {artist_name}")
            return []
    except Exception as e:
        print(f"Error fetching genre for {artist_name}: {e}")
        return []

def process_geo_tracks(data, country):
    cleaned_data = []
    if data and 'tracks' in data:
        for track in data['tracks']['track']:
            genres = get_spotify_genres(track['artist']['name'])
            cleaned_track = {
                'country': country,
                'name': track['name'],
                'artist': track['artist']['name'],
                'listeners': track['listeners'],
                'mbid': track['mbid'],  # Optional: MusicBrainz ID
                'url': track['url'],
                'genres': genres  # Add genres here
            }
            cleaned_data.append(cleaned_track)
    else:
        print(f"No tracks found for {country}. Data received: {data}")
    return cleaned_data

def save_grouped_data(all_tracks):
    country_groups = {}

    for track in all_tracks:
        country = track['country']
        if country not in country_groups:
            country_groups[country] = []
        country_groups[country].append(track)

    # Save grouped data to a JSON file
    with open('top_tracks_by_country_with_genres.json', 'w') as f:
        json.dump(country_groups, f, indent=4)

    # Save each country's hot tracks song names to separate files
    for country, tracks in country_groups.items():
        with open(f'{country.replace(" ", "_")}_hot_tracks.txt', 'w') as f:
            for track in tracks:
                f.write(f"{track['name']} - {track['artist']} - Genres: {', '.join(track['genres'])}\n")

if __name__ == '__main__':
    all_tracks = []

    for country in countries:
        print(f"Fetching top tracks for {country}...")
        raw_data = fetch_geo_tracks(country)
        cleaned_data = process_geo_tracks(raw_data, country)

        if cleaned_data:
            all_tracks.extend(cleaned_data)

    save_grouped_data(all_tracks)
    print("Processed data with genres saved to top_tracks_by_country_with_genres.json and individual hot tracks files.")