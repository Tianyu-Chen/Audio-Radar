// tests/evaluation/metrics/SoftClusteringMetrics.js

import GMMClusteringMetrics from './GMMClusteringMetrics.js';

export default class SoftClusteringMetrics extends GMMClusteringMetrics {
    constructor() {
        super(); // Initialize GMM base class
        
        // Add soft clustering specific metrics while keeping GMM metrics
        this.metrics = {
            ...this.metrics,  // Keep GMM metrics
            entropy: [],
            membershipStrength: [],
            clusterOverlap: []
        };
    }

    // Override evaluateClustering to add soft clustering metrics while keeping GMM functionality
    evaluateClustering(data, K) {
        // First get GMM results using parent class
        const gmmResults = super.evaluateClustering(data, K);
        
        // Add soft clustering analysis
        const softMetrics = {
            entropy: this.calculateClusteringEntropy(gmmResults.gmmResult.responsibilities),
            membershipStrength: this.calculateMembershipStrength(gmmResults.gmmResult.responsibilities),
            clusterOverlap: this.calculateClusterOverlap(gmmResults.gmmResult.responsibilities)
        };

        // Combine GMM and soft clustering results
        return {
            ...gmmResults,
            softMetrics
        };
    }

    // Add soft clustering specific methods while keeping GMM methods
    calculateClusteringEntropy(responsibilities) {
        const pointEntropies = responsibilities.map(resp => {
            return -resp.reduce((sum, p) => {
                if (p > 0) {
                    return sum + p * Math.log2(p);
                }
                return sum;
            }, 0);
        });

        return {
            average: this.calculateAverage(pointEntropies),
            max: Math.max(...pointEntropies),
            min: Math.min(...pointEntropies)
        };
    }

    calculateMembershipStrength(responsibilities) {
        const maxMemberships = responsibilities.map(resp => 
            Math.max(...resp)
        );

        return {
            average: this.calculateAverage(maxMemberships),
            distribution: this.getMembershipDistribution(maxMemberships)
        };
    }

    calculateClusterOverlap(responsibilities, threshold = 0.2) {
        const overlaps = responsibilities.map(resp => 
            resp.filter(p => p >= threshold).length
        );

        return {
            averageOverlap: this.calculateAverage(overlaps),
            multipleAssignments: overlaps.filter(o => o > 1).length / overlaps.length
        };
    }

    getMembershipDistribution(memberships) {
        const bins = 10;
        const distribution = Array(bins).fill(0);
        
        memberships.forEach(m => {
            const binIndex = Math.min(Math.floor(m * bins), bins - 1);
            distribution[binIndex]++;
        });

        return distribution.map(count => count / memberships.length);
    }

    generateReport() {
        // Get base GMM report
        const gmmReport = super.generateReport();
        
        // Add soft clustering metrics
        return {
            ...gmmReport,
            softClustering: {
                entropy: {
                    latest: this.metrics.entropy[this.metrics.entropy.length - 1],
                    history: this.metrics.entropy,
                    trend: this.calculateTrend(this.metrics.entropy.map(e => e.value))
                },
                membershipStrength: {
                    latest: this.metrics.membershipStrength[this.metrics.membershipStrength.length - 1],
                    history: this.metrics.membershipStrength
                },
                clusterOverlap: {
                    latest: this.metrics.clusterOverlap[this.metrics.clusterOverlap.length - 1],
                    history: this.metrics.clusterOverlap
                }
            }
        };
    }
}