
# Genre Radar

## Project Overview

**Genre Radar** is a web application that allows users to explore music preferences across the world through an interactive map, and discover personalized song recommendations based on specific regional trends. By integrating data from the Spotify API, users can visually explore which music genres are popular in different countries and receive song suggestions that match their taste within a specific region.

## Objectives

1. **Understand Music Preferences**: Learn about the favorite music styles of people from different countries by analyzing popular songs.
2. **Create a Map**: Build a dynamic and colorful world map that displays the most loved music genres in each country.
3. **Help Users Discover Music**: Allow users to input their favorite songs and receive personalized song recommendations that align with their tastes in different regions.

## Current Practice & Limitations

Today, most music recommendations are global, lacking a geographic focus. Algorithms suggest music based on overall user behavior but often miss out on regional nuances and cultural influences. The challenges with current systems include:

- Lack of focus on what's trending in specific countries.
- Limited personalization based on region-specific preferences.
- Algorithm bias towards mainstream trends.
- Limited visual tools for exploring global music trends.

## Our Approach

**Genre Radar** combines data visualization with personalized recommendations in a unique way:

- **Global Visualization**: An interactive map lets users explore music preferences in different countries, a feature not typically available on other platforms.
- **Personalized Regional Recommendations**: By connecting their Spotify account, users receive recommendations based on their personal tastes combined with local music trends.

We believe this approach will succeed because it combines curiosity with personalization, creating an engaging and user-relevant experience.

### Who Cares?
- **Music Enthusiasts**: Those eager to explore new music and cultures.
- **Travelers**: Individuals seeking authentic local experiences through music.
- **Content Creators**: Musicians, DJs, and influencers looking to keep up with regional trends.
- **Streaming Platforms**: Companies interested in providing more personalized, region-specific music recommendations.

## Expected Impact

If successful, **Genre Radar** will:

- Foster greater cross-cultural music discovery.
- Help users find new music that aligns with their tastes, quickly and effortlessly.
- Encourage users to engage more deeply with music from different parts of the world.

### Measuring Success
Our progress and success will be measured through:

- **User Feedback**: Gather insights from users about their experience with the map and recommendation features.
- **Engagement Metrics**: Track user interaction with the map, including time spent exploring different countries and using the recommendation feature.
- **Model Evaluation**: Assess the accuracy and relevance of song recommendations using user ratings.

## Risks and Payoffs

### Risks
- **Data Sufficiency**: The availability of popular songs for each country from the Spotify API may be limited, leading to an incomplete picture of global music preferences.
- **Model Effectiveness**: There is a risk that the recommendation model may not provide accurate or satisfying suggestions.

### Payoffs
- **Enhanced Music Discovery**: Users can explore new music effortlessly, breaking through language and platform barriers.
- **Interactive Exploration**: The map encourages users to learn about global music trends, increasing user engagement.

## Project Structure

1. **API Integration** (Team Member A)
   - Responsible for retrieving data from the Spotify API and setting up authentication.
   - Expected Completion: Week 2.

2. **Data Cleaning & Preparation** (Team Member B)
   - Processes and organizes data for visualization.
   - Expected Completion: Week 3.

3. **Visualization with D3** (Team Member C)
   - Develops an interactive map using D3 to display music genre distribution across countries.
   - Expected Completion: Week 5.

4. **Backend & Server Setup** (Team Member D)
   - Manages AWS setup and deployment, ensuring server stability.
   - Expected Completion: Week 4.

5. **Frontend & User Interface** (Team Member E)
   - Designs the UI, integrates D3 visualizations, and ensures a user-friendly interface.
   - Expected Completion: Week 5.
  

## Music Recommendation System and Top Songs

### Top Songs by Country

The **Top Tracks by Country** feature visualizes the most popular songs within each selected country, based on listener count data from the Spotify API. Users can click on a country from the interactive map, which displays a list of songs ranked by their popularity. Each entry includes the song name, artist, number of listeners, and a link to listen directly on Spotify. This feature helps users understand regional music preferences, discover trending tracks, and explore how musical tastes vary globally.

![Top Songs by Country Screenshot](/Graph/data/Top_Song.png)

### Personalized Music Recommendation System

Our **Music Recommendation System** provides users with tailored song suggestions based on regional trends and their personal preferences. By selecting a country on the interactive map, users can adjust various musical attributes (like danceability, energy, loudness, and key) to refine recommendations that match their taste. The system considers local popularity trends to ensure the recommended tracks resonate with users within the context of specific cultural preferences.

This tool is unique as it combines personal preference with regional trends, offering a geographically contextualized music discovery experience.

![Music Recommendation System Screenshot](/Graph/Recommendation.png)

---

### Running the Application

1. Navigate to the project directory:
   ```bash
   cd C:\Gatech\CSE 6242\Final Project
   ```
2. Clone the repository:
   ```bash
   git clone https://github.com/Tianyu-Chen/Genre-Radar.git
   ```
3. Enter the cloned directory:
   ```bash
   cd Genre-Radar
   ```
4. Start a local server to run the application:
   ```bash
   python -m http.server 8000
   ```
5. Visit `http://localhost:8000` in your web browser to view the application.

This will allow you to interact with both the **Top Tracks by Country** and **Music Recommendation System** features, providing a hands-on experience with the personalized music recommendations and regional music preferences across the globe.

## Midterm and Final Deliverables

- **Midterm Milestone**: Basic map visualization with initial data from Spotify, hosted on AWS. Due by Week 4.
- **Final Milestone**: Fully integrated map with personalized recommendation feature, deployed and ready for user testing. Due by Week 5.

## Costs

We plan to use either AWS or Azure for hosting, keeping a close watch on potential expenses to ensure we meet project requirements without exceeding our budget.

## Getting Started

### Prerequisites

- **Spotify Developer Account**: Required to access the Spotify API.
- **AWS Account**: For hosting the web application.
- **D3.js**: For creating the interactive map.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/genre-radar.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your Spotify API keys in a `.env` file:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run start
   ```
2. Visit `http://localhost:3000` to view the application locally.
3. Deploy to AWS using the provided scripts in the `deploy` folder.

### Contributing

We welcome contributions! Please see `CONTRIBUTING.md` for more information on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
