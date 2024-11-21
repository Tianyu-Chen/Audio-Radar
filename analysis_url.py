import requests
import base64
import json

# Step 1: Set your Spotify API credentials
CLIENT_ID = '6c1b910573274778824eaba5f4cd8edc'
CLIENT_SECRET = 'ee69c65855884918acf6b811a2c07244'

# Function to get an access token
def get_access_token(client_id, client_secret):
    # Encode Client ID and Client Secret
    client_creds = f"{client_id}:{client_secret}"
    client_creds_b64 = base64.b64encode(client_creds.encode()).decode()

    # Spotify API Token URL
    token_url = "https://accounts.spotify.com/api/token"

    # Request headers and data
    headers = {
        "Authorization": f"Basic {client_creds_b64}",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    data = {
        "grant_type": "client_credentials"
    }

    # Make a POST request to get the token
    response = requests.post(token_url, headers=headers, data=data)
    response_data = response.json()

    if response.status_code == 200:
        return response_data["access_token"]
    else:
        raise Exception(f"Failed to get token: {response_data}")

# Function to make an API request
def make_authenticated_request(access_token, endpoint):
    # Add the token to the request headers
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # Make a GET request to the endpoint
    response = requests.get(endpoint, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Request failed: {response.json()}")

def save_data_tofile(data, filename):
    with open(filename, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4)
    print(f"data saved to {filename}")

# Main script
if __name__ == "__main__":
    try:
        # Get the access token
        token = get_access_token(CLIENT_ID, CLIENT_SECRET)
        print("Access token:", token)

        # Define the Spotify endpoint
        endpoint = "https://api.spotify.com/v1/audio-analysis/003vvx7Niy0yvhvHt4a68B"

        # Make the API request
        data = make_authenticated_request(token, endpoint)
        output_path = "./data/spotify_audio_analysis.json"
        save_data_tofile(data, output_path)
    except Exception as e:
        print("Error:", e)
