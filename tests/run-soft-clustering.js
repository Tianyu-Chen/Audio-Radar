// tests/run-soft-clustering.js

import SoftClusteringMetrics from './evaluation/metrics/SoftClusteringMetrics.js';
import fs from 'fs/promises';
import path from 'path';

async function loadCountryData() {
    const projectRoot = process.cwd();
    const dataDir = path.join(projectRoot, 'data', 'audio_features_by_country');
    console.log('Looking for data in:', dataDir);
    
    const allData = [];
    
    try {
        const files = await fs.readdir(dataDir);
        console.log(`Found ${files.length} country files`);
        
        for (const file of files) {
            if (file.endsWith('_audio_features.json')) {
                const filePath = path.join(dataDir, file);
                const countryData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
                const countryName = file.replace('_audio_features.json', '');
                
                const processedData = countryData.map(song => ({
                    ...song,
                    country: countryName
                }));
                
                allData.push(...processedData);
                console.log(`Processed ${processedData.length} songs from ${countryName}`);
            }
        }
        return allData;
    } catch (error) {
        console.error('Error loading country data:', error);
        throw error;
    }
}

async function runSoftClustering() {
    try {
        console.log('Starting soft clustering analysis...');
        const softMetrics = new SoftClusteringMetrics();

        console.log('Loading audio features from all countries...');
        const musicData = await loadCountryData();
        console.log(`Loaded ${musicData.length} songs from all countries`);

        // Test different numbers of clusters
        const results = [];
        const kRange = [3, 4];
        
        for (const k of kRange) {
            console.log(`\nTesting with ${k} clusters...`);
            const result = softMetrics.evaluateClustering(musicData, k);
            
            // Print traditional metrics
            console.log(`\nK=${k} Results:`);
            console.log(`- Silhouette Score: ${result.metrics.silhouetteScore.toFixed(3)}`);
            console.log(`- Davies-Bouldin Index: ${result.metrics.dbiScore.toFixed(3)}`);
            console.log(`- BIC Score: ${result.metrics.bicScore.toFixed(3)}`);
            console.log(`- AIC Score: ${result.metrics.aicScore.toFixed(3)}`);
            
            // Print soft clustering metrics
            console.log('\nSoft Clustering Metrics:');
            console.log(`- Entropy: ${result.softMetrics.entropy.average.toFixed(3)}`);
            console.log(`- Average Membership Strength: ${result.softMetrics.membershipStrength.average.toFixed(3)}`);
            console.log(`- Cluster Overlap Rate: ${result.softMetrics.clusterOverlap.multipleAssignments.toFixed(3)}`);

            // Analyze cluster composition
            result.clusters.forEach((cluster, i) => {
                const clusterPoints = musicData.filter((_, idx) => result.clusters[idx] === i);
                const responsibilities = result.gmmResult.responsibilities
                    .filter((_, idx) => result.clusters[idx] === i)
                    .map(r => r[i]);
                
                console.log(`\nCluster ${i} (${clusterPoints.length} songs):`);
                
                // Show membership strength distribution
                const strongMembers = responsibilities.filter(r => r > 0.7).length;
                const mediumMembers = responsibilities.filter(r => r > 0.4 && r <= 0.7).length;
                const weakMembers = responsibilities.filter(r => r <= 0.4).length;
                
                console.log('Membership Distribution:');
                console.log(`- Strong (>0.7): ${strongMembers} songs (${(strongMembers/clusterPoints.length*100).toFixed(1)}%)`);
                console.log(`- Medium (0.4-0.7): ${mediumMembers} songs (${(mediumMembers/clusterPoints.length*100).toFixed(1)}%)`);
                console.log(`- Weak (≤0.4): ${weakMembers} songs (${(weakMembers/clusterPoints.length*100).toFixed(1)}%)`);

                // Show country distribution
                const countryDist = {};
                clusterPoints.forEach(song => {
                    countryDist[song.country] = (countryDist[song.country] || 0) + 1;
                });
                
                const topCountries = Object.entries(countryDist)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);
                
                console.log('\nTop Countries:');
                topCountries.forEach(([country, count]) => {
                    console.log(`- ${country}: ${count} songs (${(count/clusterPoints.length*100).toFixed(1)}%)`);
                });

                // Show average features
                const features = ['danceability', 'energy', 'tempo', 'valence', 'acousticness'];
                const avgFeatures = features.reduce((acc, feature) => {
                    acc[feature] = clusterPoints.reduce((sum, song) => sum + song[feature], 0) / clusterPoints.length;
                    return acc;
                }, {});
                
                console.log('\nAverage Features:');
                Object.entries(avgFeatures).forEach(([feature, value]) => {
                    console.log(`- ${feature}: ${value.toFixed(3)}`);
                });
            });
            
            results.push({
                k,
                metrics: result.metrics,
                softMetrics: result.softMetrics,
                clusterAnalysis: result.clusters
            });
        }

        // Save results
        const resultsPath = path.join(process.cwd(), 'data', 'soft_clustering_results.json');
        await fs.writeFile(
            resultsPath,
            JSON.stringify({
                timestamp: new Date().toISOString(),
                results,
                summary: softMetrics.generateReport()
            }, null, 2)
        );

        console.log('\nAnalysis complete! Check soft_clustering_results.json for detailed results.');
    } catch (error) {
        console.error('Error running soft clustering:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

runSoftClustering().catch(console.error);