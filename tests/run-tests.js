// tests/run-tests.js

import GMMClusteringMetrics from './evaluation/metrics/GMMClusteringMetrics.js';
import SoftClusteringMetrics from './evaluation/metrics/SoftClusteringMetrics.js';
import * as DataUtils from './evaluation/utils/DataUtils.js';
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

async function analyzeClusterResults(data, result, type = 'gmm') {
    const analysis = {
        overall: {
            totalSongs: data.length,
            uniqueCountries: new Set(data.map(d => d.country)).size,
            clusterCount: result.clusters.length
        },
        clusters: {}
    };

    // Analyze each cluster
    const uniqueClusters = [...new Set(result.clusters)];
    for (const cluster of uniqueClusters) {
        const clusterData = data.filter((_, i) => result.clusters[i] === cluster);
        
        // Country distribution
        const countryDist = {};
        clusterData.forEach(d => {
            countryDist[d.country] = (countryDist[d.country] || 0) + 1;
        });

        // Feature averages
        const features = {};
        ['danceability', 'energy', 'tempo', 'valence', 'acousticness'].forEach(feature => {
            features[feature] = DataUtils.calculateMean(clusterData.map(d => d[feature]));
        });

        // Add membership strength for soft clustering
        let membershipInfo = {};
        if (type === 'soft' && result.gmmResult.responsibilities) {
            const clusterMemberships = result.gmmResult.responsibilities.map(r => r[cluster]);
            membershipInfo = {
                averageStrength: DataUtils.calculateMean(clusterMemberships),
                strongMembers: clusterMemberships.filter(m => m > 0.5).length
            };
        }

        analysis.clusters[cluster] = {
            size: clusterData.length,
            percentage: (clusterData.length / data.length * 100).toFixed(2) + '%',
            countryDistribution: countryDist,
            features,
            membershipInfo,
            topCountries: Object.entries(countryDist)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([country, count]) => ({
                    country,
                    count,
                    percentage: (count / clusterData.length * 100).toFixed(2) + '%'
                }))
        };
    }

    return analysis;
}

async function runTests() {
    try {
        console.log('Starting clustering analysis...');
        const gmmMetrics = new GMMClusteringMetrics();
        const softMetrics = new SoftClusteringMetrics();

        console.log('Loading audio features from all countries...');
        const musicData = await loadCountryData();
        console.log(`Loaded ${musicData.length} songs from all countries`);

        // Test different numbers of clusters
        const results = {
            gmm: [],
            soft: []
        };
        
        const kRange = [3, 4, 5];// Adjust number of Clusters
        
        for (const k of kRange) {
            console.log(`\nTesting with ${k} clusters...`);
            
            // GMM Clustering
            const gmmResult = gmmMetrics.evaluateClustering(musicData, k);
            const gmmAnalysis = await analyzeClusterResults(musicData, gmmResult, 'gmm');
            
            // Soft Clustering
            const softResult = softMetrics.evaluateClustering(musicData, k);
            const softAnalysis = await analyzeClusterResults(musicData, softResult, 'soft');
            
            // Print GMM results
            console.log(`\nGMM K=${k} Results:`);
            console.log(`- Silhouette Score: ${gmmResult.metrics.silhouetteScore.toFixed(3)}`);
            console.log(`- Davies-Bouldin Index: ${gmmResult.metrics.dbiScore.toFixed(3)}`);
            console.log(`- BIC Score: ${gmmResult.metrics.bicScore.toFixed(3)}`);
            console.log(`- AIC Score: ${gmmResult.metrics.aicScore.toFixed(3)}`);
            
            // Print cluster analysis
            Object.entries(gmmAnalysis.clusters).forEach(([clusterId, cluster]) => {
                console.log(`\nCluster ${clusterId} (${cluster.size} songs, ${cluster.percentage}):`);
                console.log('Top countries:');
                cluster.topCountries.forEach(({ country, count, percentage }) => {
                    console.log(`  ${country}: ${count} songs (${percentage})`);
                });
                console.log('Average features:');
                Object.entries(cluster.features).forEach(([feature, value]) => {
                    console.log(`  ${feature}: ${value.toFixed(3)}`);
                });
            });
            
            // Print Soft Clustering additional insights
            if (softResult.softMetrics) {
                console.log('\nSoft Clustering Metrics:');
                console.log(`- Entropy: ${softResult.softMetrics.entropy.average.toFixed(3)}`);
                console.log(`- Average Membership Strength: ${
                    softResult.softMetrics.membershipStrength.average.toFixed(3)}`);
                console.log(`- Cluster Overlap Rate: ${
                    softResult.softMetrics.clusterOverlap.multipleAssignments.toFixed(3)}`);
            }
            
            // Store results
            results.gmm.push({
                k,
                metrics: gmmResult.metrics,
                analysis: gmmAnalysis
            });
            
            results.soft.push({
                k,
                metrics: softResult.metrics,
                softMetrics: softResult.softMetrics,
                analysis: softAnalysis
            });
        }

        // Save detailed results
        const resultsPath = path.join(process.cwd(), 'data', 'clustering_results.json');
        await fs.writeFile(
            resultsPath,
            JSON.stringify({
                timestamp: new Date().toISOString(),
                results,
                gmmSummary: gmmMetrics.generateReport(),
                softSummary: softMetrics.generateReport()
            }, null, 2)
        );

        // Print best K values
        console.log('\nBest K values:');
        console.log('GMM Metrics:');
        console.log(`Silhouette Score: K = ${getBestK(results.gmm, 'silhouetteScore', true)}`);
        console.log(`Davies-Bouldin Index: K = ${getBestK(results.gmm, 'dbiScore', false)}`);
        console.log(`AIC: K = ${getBestK(results.gmm, 'aicScore', false)}`);
        console.log(`BIC: K = ${getBestK(results.gmm, 'bicScore', false)}`);

        console.log('\nAnalysis complete! Check clustering_results.json for detailed results.');
    } catch (error) {
        console.error('Error running tests:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

function getBestK(results, metric, higherIsBetter = true) {
    return results.reduce((best, current) => {
        if (!best || (higherIsBetter ? 
            current.metrics[metric] > best.metrics[metric] : 
            current.metrics[metric] < best.metrics[metric])) {
            return current;
        }
        return best;
    }).k;
}

runTests().catch(console.error);
