# **Music Radar**

## **Project Overview**

**Music Radar** is a web application that allows users to explore music preferences worldwide through an interactive map. The application offers personalized song recommendations based on regional trends, integrating data from the Spotify API. Users can visually discover the most popular music genres across different countries and receive song suggestions tailored to their preferences.

---

## **Objectives**

1. **Understand Music Preferences**  
   Learn about the favorite music styles of people from different countries by analyzing popular songs.

2. **Create a Map**  
   Build a dynamic and colorful world map that displays the most loved music genres in each country.

3. **Help Users Discover Music**  
   Allow users to input their favorite songs and receive personalized song recommendations that align with their tastes in different regions.

---

## **Current Practice & Limitations**

Today, most music recommendations are global, lacking a geographic focus. Algorithms suggest music based on overall user behavior but often miss out on regional nuances and cultural influences. The challenges with current systems include:

- Lack of focus on what's trending in specific countries.
- Limited personalization based on region-specific preferences.
- Algorithm bias towards mainstream trends.
- Limited visual tools for exploring global music trends.

---

## **Our Approach**

**Music Radar** combines data visualization with personalized recommendations in a unique way:

- **Global Visualization**: An interactive map lets users explore music preferences in different countries, a feature not typically available on other platforms.  
- **Personalized Regional Recommendations**: By connecting their Spotify account, users receive recommendations based on their personal tastes combined with local music trends.

We believe this approach will succeed because it combines curiosity with personalization, creating an engaging and user-relevant experience.

---

## **Who Cares?**

- **Music Enthusiasts**: Those eager to explore new music and cultures.  
- **Travelers**: Individuals seeking authentic local experiences through music.  
- **Content Creators**: Musicians, DJs, and influencers looking to keep up with regional trends.  
- **Streaming Platforms**: Companies interested in providing more personalized, region-specific music recommendations.

---

## **Expected Impact**

If successful, **Music Radar** will:
- Foster greater cross-cultural music discovery.  
- Help users find new music that aligns with their tastes, quickly and effortlessly.  
- Encourage users to engage more deeply with music from different parts of the world.

---

## **Features**

### **Top Songs by Country**

The **Top Tracks by Country** feature visualizes the most popular songs within each selected country, based on listener count data from the Spotify API. Users can click on a country from the interactive map, which displays a list of songs ranked by their popularity. Each entry includes the song name, artist, number of listeners, and a link to listen directly on Spotify. This feature helps users understand regional music preferences, discover trending tracks, and explore how musical tastes vary globally.

![Top Songs by Country Screenshot](/Graph/Top_Song.png)

---

### **Personalized Music Recommendation System**

Our **Music Recommendation System** provides users with tailored song suggestions based on regional trends and their personal preferences. By selecting a country on the interactive map, users can adjust various musical attributes (like danceability, energy, loudness, and key) to refine recommendations that match their taste. The system considers local popularity trends to ensure the recommended tracks resonate with users within the context of specific cultural preferences.

![Music Recommendation System Screenshot](/Graph/Recommendation.png)

---

## **Evaluation Structure**

```
project_root/
├── tests/
│   ├── evaluation/
│   │   ├── metrics/
│   │   │   ├── GMMClusteringMetrics.js    # Original GMM file
│   │   │   └── SoftClusteringMetrics.js   # soft clustering file
│   │   └── utils/
│   │       └── DataUtils.js
│   └── run-tests.js
├── data/
│   └── audio_features_by_country/          # Our data files
└── package.json
```

---

## **Running the Algorithm**

1. **Prepare the Environment**  
   Ensure that Node.js and all project dependencies are installed:
   ```bash
   npm install
   ```

2. **Run the Algorithm**  
   Execute the clustering and evaluation tests using:
   ```bash
   node tests/run-tests.js
   ```

3. **View Results**  
   The output will include metrics such as:
   - Silhouette Coefficient (SC)  
   - Davies-Bouldin Index (DBI)  
   - Entropy, Membership Strength, and Cluster Overlap  

---

## **Running the Application**

### **Using Node.js**
1. Clone the repository:
   ```bash
   git clone https://github.com/Tianyu-Chen/Music-Radar.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Music-Radar
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run start
   ```
5. Access the application at `http://localhost:3000`.

### **Using Python**
1. Clone the repository:
   ```bash
   git clone https://github.com/Tianyu-Chen/Music-Radar.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Music-Radar
   ```
3. Start a local server:
   ```bash
   python -m http.server 8000
   ```
4. Access the application in your browser at `http://localhost:8000`.

---

## **Midterm and Final Deliverables**

- **Midterm Milestone**: Basic map visualization with initial data from Spotify, hosted on AWS. *(Due Week 4)*  
- **Final Milestone**: Fully integrated map with personalized recommendation feature, deployed and ready for user testing. *(Due Week 5)*  

---

## **Costs**

We plan to use either AWS or Azure for hosting, keeping a close watch on potential expenses to ensure we meet project requirements without exceeding our budget.

---

## **Contributing**

We welcome contributions! Please see `CONTRIBUTING.md` for more information on how to contribute to this project.

---

## **License**

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

---
