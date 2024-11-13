from flask import Flask, render_template, send_from_directory
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/top_song')
def top_song():
    return render_template('top_song.html')

@app.route('/data/<path:filename>', methods=['GET'])
def send_json(filename):
    return send_from_directory('data/audio_features_by_country', filename)

if __name__ == '__main__':
    app.run(debug=True)