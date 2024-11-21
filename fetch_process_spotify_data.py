import requests
import base64
import json

SPOTIFY_CLIENT_ID = '6c1b910573274778824eaba5f4cd8edc'
SPOTIFY_CLIENT_SECRET = 'ee69c65855884918acf6b811a2c07244'

def get_access_token():
    url = 'https://accounts.spotify.com/api/token'
    headers = {
        'Authorization': f'Basic {base64.b64encode(f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()).decode()}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    data = {'grant_type': 'client_credentials'}
    response = requests.post(url, headers=headers, data=data)
    return response.json()['access_token']

def read_tracks_from_file(filename):
    tracks = []
    with open(filename, 'r') as f:
        for line in f:
            # Split on ' - ' to separate song name and artist
            if ' - ' in line:
                track_name, artist_name = line.strip().split(' - ', 1)
                tracks.append({'track_name': track_name, 'artist_name': artist_name})
    return tracks

def search_track(track_name, artist_name):
    access_token = get_access_token()
    url = f'https://api.spotify.com/v1/search?q=track:{track_name} artist:{artist_name}&type=track'
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        tracks = data.get('tracks', {}).get('items', [])
        if tracks:
            return tracks[0]['id']  # Return the first track's ID
    else:
        print(f"Error searching for {track_name} by {artist_name}: {response.status_code} - {response.text}")
    return None

def uri_to_url (uri):
    track_id = uri.split(':')[2]
    return f'https://open.spotify.com/track/{track_id}'


def get_audio_features(track_id, track_name):
    access_token = get_access_token()
    url = f'https://api.spotify.com/v1/audio-features/{track_id}'
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        audio_features = response.json()
        audio_features['track_name'] = track_name
        audio_features['uri'] = uri_to_url(audio_features['uri'])
        return audio_features
    else:
        print(f"Error fetching audio features for track ID {track_id}: {response.status_code} - {response.text}")
    return None

if __name__ == '__main__':
    # Read the tracks from the provided file
    country_name = 'China'
    filename = f'data/hot_tracks_by_country/{country_name.replace(" ", "_")}_hot_tracks.txt'  # Format the filename
    tracks = read_tracks_from_file(filename)
    
    all_audio_features = []
    
    for track in tracks:
        track_id = search_track(track['track_name'], track['artist_name'])
        if track_id:
            audio_features = get_audio_features(track_id, track['track_name'])
            if audio_features:
                all_audio_features.append(audio_features)

    with open(f'data/audio_features_by_country/{country_name.replace(" ", "_")}_audio_features.json', 'w') as f:
        json.dump(all_audio_features, f, indent=4)

    print("Audio features retrieved and saved to audio_features.json.")