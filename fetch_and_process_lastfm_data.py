import requests
import json

LASTFM_API_KEY = '4524a5438476c02cff9c7312e8a7deba'

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

def fetch_geo_tracks(country):
    url = f'https://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country={country}&api_key={LASTFM_API_KEY}&format=json'
    response = requests.get(url)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching data for {country}: {response.status_code}")
        return None
    
def process_geo_tracks(data, country):
    # Extract and clean the data
    cleaned_data = []
    if data and 'tracks' in data:
        for track in data['tracks']['track']:
            cleaned_track = {
                'country': country,
                'name': track['name'],
                'artist': track['artist']['name'],
                'listeners': track['listeners'],
                'mbid': track['mbid'],  # Optional: MusicBrainz ID
                'url': track['url']
            }
            cleaned_data.append(cleaned_track)
    return cleaned_data

def save_to_file(data, filename='data/top_tracks_by_country.json'):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)
    
if __name__ == '__main__':
    all_tracks = []

    for country in countries:
        print(f"Fetching top tracks for {country}...")
        raw_data = fetch_geo_tracks(country)
        print(raw_data)
        cleaned_data = process_geo_tracks(raw_data, country)

        if cleaned_data:
            all_tracks.extend(cleaned_data)

    save_to_file(all_tracks)
    print("Processed data saved to top_tracks_by_country.json.")

