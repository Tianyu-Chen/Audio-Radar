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
    with open('top_tracks_by_country.json', 'w') as f:
        json.dump(country_groups, f, indent=4)

    # Save each country's hot tracks song names to separate files
    for country, tracks in country_groups.items():
        with open(f'{country.replace(" ", "_")}_hot_tracks.txt', 'w') as f:
            for track in tracks:
                f.write(f"{track['name']} - {track['artist']}\n")

if __name__ == '__main__':
    all_tracks = []

    for country in countries:
        print(f"Fetching top tracks for {country}...")
        raw_data = fetch_geo_tracks(country)
        cleaned_data = process_geo_tracks(raw_data, country)

        if cleaned_data:
            all_tracks.extend(cleaned_data)

    save_grouped_data(all_tracks)
    print("Processed data saved to top_tracks_by_country.json and individual hot tracks files.")

