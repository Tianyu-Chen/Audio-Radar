// tests/evaluation/index.js

import ClusteringMetrics from './metrics/ClusteringMetrics.js';
import MapMetrics from './metrics/MapMetrics.js';
import PerformanceMetrics from './metrics/PerformanceMetrics.js';
import TestReporter from './utils/TestReporter.js';
import DataValidator from './utils/DataValidator.js';

export default class MusicRecommendationTest {
    constructor() {
        this.clusteringMetrics = new ClusteringMetrics();
        this.mapMetrics = new MapMetrics('#map');
        this.performanceMetrics = new PerformanceMetrics();
        this.reporter = new TestReporter();
        this.validator = new DataValidator();
        
        this.testResults = {
            validation: {},
            clustering: {},
            map: {},
            performance: {}
        };
    }

    async runTests() {
        console.log('Starting comprehensive tests...');
        
        try {
            // 1. Data Validation
            await this.validateData();
            
            // 2. Map Evaluation
            await this.evaluateMap();
            
            // 3. Clustering Evaluation
            await this.evaluateClustering();
            
            // 4. Performance Monitoring
            await this.monitorPerformance();
            
            // Generate and return final report
            return this.generateReport();
            
        } catch (error) {
            console.error('Test execution failed:', error);
            this.testResults.error = error;
            return this.generateErrorReport(error);
        }
    }

    async validateData() {
        console.log('Validating data...');
        
        try {
            // Get data from the page
            const musicData = this.getMusicData();
            const regionData = this.getRegionData();
            
            // Validate data
            this.testResults.validation = {
                music: this.validator.validateMusicData(musicData),
                regions: this.validator.validateRegionData(regionData),
                distribution: this.validator.validateDataDistribution(musicData)
            };
        } catch (error) {
            console.error('Data validation failed:', error);
            throw new Error(`Data validation failed: ${error.message}`);
        }
    }

    async evaluateMap() {
        console.log('Evaluating map visualization...');
        
        try {
            // Start tracking map interactions
            this.mapMetrics.startInteractionTracking();
            
            // Evaluate map rendering
            this.testResults.map.rendering = this.mapMetrics.evaluateMapRendering();
            
            // Evaluate zoom behavior
            this.testResults.map.zoom = this.mapMetrics.evaluateZoomBehavior();
            
            // Monitor for 5 seconds
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Get map evaluation results
            this.testResults.map.metrics = this.mapMetrics.generateReport();
        } catch (error) {
            console.error('Map evaluation failed:', error);
            throw new Error(`Map evaluation failed: ${error.message}`);
        }
    }

    async evaluateClustering() {
        console.log('Evaluating clustering...');
        
        try {
            const musicData = this.getMusicData();
            const regions = this.getRegionData();
            
            // Calculate clustering metrics
            this.testResults.clustering = {
                silhouette: this.clusteringMetrics.calculateSilhouetteCoefficient(musicData, regions),
                dbi: this.clusteringMetrics.calculateDBI(musicData, regions)
            };
        } catch (error) {
            console.error('Clustering evaluation failed:', error);
            throw new Error(`Clustering evaluation failed: ${error.message}`);
        }
    }

    async monitorPerformance() {
        console.log('Monitoring performance...');
        
        try {
            // Start performance monitoring
            this.performanceMetrics.startMonitoring();
            
            // Monitor for 10 seconds
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Stop monitoring and get results
            this.performanceMetrics.stopMonitoring();
            this.testResults.performance = this.performanceMetrics.generateReport();
        } catch (error) {
            console.error('Performance monitoring failed:', error);
            throw new Error(`Performance monitoring failed: ${error.message}`);
        }
    }

    getMusicData() {
        // 从页面获取音乐数据
        try {
            const dataTable = document.querySelector('#section table');
            if (!dataTable) throw new Error('Music data table not found');

            const rows = Array.from(dataTable.querySelectorAll('tr')).slice(1); // Skip header
            return rows.map(row => {
                const cells = row.querySelectorAll('td');
                return {
                    id: cells[0]?.textContent,
                    analysisUrl: cells[1]?.textContent,
                    // 添加其他需要的字段
                };
            });
        } catch (error) {
            console.error('Failed to get music data:', error);
            throw new Error('Failed to get music data from page');
        }
    }

    getRegionData() {
        // 从地图获取区域数据
        try {
            const regions = {};
            const countries = document.querySelectorAll('.country');
            
            countries.forEach(country => {
                const regionId = country.getAttribute('data-region');
                const songs = JSON.parse(country.getAttribute('data-songs') || '[]');
                if (regionId) {
                    regions[regionId] = songs;
                }
            });
            
            return regions;
        } catch (error) {
            console.error('Failed to get region data:', error);
            throw new Error('Failed to get region data from map');
        }
    }

    generateReport() {
        try {
            return this.reporter.generateReport({
                clustering: this.testResults.clustering,
                map: this.testResults.map,
                performance: this.testResults.performance,
                validation: this.testResults.validation
            });
        } catch (error) {
            console.error('Report generation failed:', error);
            return this.generateErrorReport(error);
        }
    }

    generateErrorReport(error) {
        return {
            status: 'error',
            timestamp: new Date(),
            error: {
                message: error.message,
                stack: error.stack,
                testResults: this.testResults
            }
        };
    }

    // Utility methods
    async saveResults(report) {
        try {
            const response = await fetch('/api/test-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(report)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to save results: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Failed to save test results:', error);
            throw error;
        }
    }

    exportResults(format = 'json') {
        return this.reporter.exportResults(format);
    }
}

// Usage example:
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const tester = new MusicRecommendationTest();
        const results = await tester.runTests();
        
        // Save results
        await tester.saveResults(results);
        
        // Export results in different formats
        const jsonReport = tester.exportResults('json');
        const htmlReport = tester.exportResults('html');
        
        console.log('Test Results:', results);
    } catch (error) {
        console.error('Test execution failed:', error);
    }
});
