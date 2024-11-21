// tests/evaluation/utils/TestReporter.js

export default class TestReporter {
    constructor() {
        this.reports = [];
        this.startTime = Date.now();
    }

    generateReport(metrics) {
        const report = {
            timestamp: new Date(),
            duration: Date.now() - this.startTime,
            summary: this.generateSummary(metrics),
            details: this.generateDetails(metrics),
            recommendations: this.generateRecommendations(metrics)
        };

        this.reports.push(report);
        return report;
    }

    generateSummary(metrics) {
        return {
            clusteringQuality: {
                silhouette: metrics.silhouette?.latest?.value || 0,
                dbi: metrics.dbi?.latest?.value || 0,
                aic: metrics.aic?.latest?.value || 0,
                bic: metrics.bic?.latest?.value || 0
            },
            performance: {
                totalClusters: metrics.clusters?.length || 0,
                totalSongs: metrics.totalSongs || 0,
                processingTime: Date.now() - this.startTime
            }
        };
    }

    generateDetails(metrics) {
        return {
            clustering: {
                silhouetteHistory: metrics.silhouette?.history || [],
                dbiHistory: metrics.dbi?.history || [],
                clusterComposition: metrics.clusterComposition || {}
            },
            model: {
                aicHistory: metrics.aic?.history || [],
                bicHistory: metrics.bic?.history || []
            }
        };
    }

    generateRecommendations(metrics) {
        const recommendations = [];

        // Silhouette score recommendations
        if (metrics.silhouette?.latest?.value < 0.5) {
            recommendations.push({
                type: 'warning',
                message: 'Low silhouette score indicates poor cluster separation',
                suggestion: 'Consider adjusting feature weights or number of clusters'
            });
        }

        // DBI recommendations
        if (metrics.dbi?.latest?.value > 1.0) {
            recommendations.push({
                type: 'warning',
                message: 'High Davies-Bouldin index indicates overlapping clusters',
                suggestion: 'Try reducing the number of clusters or adjusting feature importance'
            });
        }

        return recommendations;
    }

    formatResults() {
        return {
            summary: this.generateSummary(this.reports[this.reports.length - 1]),
            history: this.reports,
            recommendations: this.generateRecommendations(this.reports[this.reports.length - 1])
        };
    }
}