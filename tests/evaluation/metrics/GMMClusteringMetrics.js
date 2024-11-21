// tests/evaluation/metrics/GMMClusteringMetrics.js

export default class GMMClusteringMetrics {
    constructor() {
        this.metrics = {
            silhouette: [],
            dbi: [],
            bic: [], 
            aic: [],
            logLikelihood: [],
            timestamps: []
        };
        
        // Feature weights for music clustering
        this.featureWeights = {
            danceability: 1.5,
            energy: 1.5,
            tempo: 0.3,      // Further reduce tempo influence
            valence: 1.2,
            acousticness: 1.5
        };
    }

    preprocessData(data) {
        console.log('Preprocessing data...');
        
        // Get features from first song
        const features = this.getNumericFeatures(data[0]);
        const featureNames = Object.keys(features);
        
        // Calculate statistics for normalization
        const stats = {};
        featureNames.forEach(feature => {
            const values = data.map(song => song[feature]);
            stats[feature] = {
                min: Math.min(...values),
                max: Math.max(...values),
                mean: values.reduce((a, b) => a + b, 0) / values.length,
                std: Math.sqrt(values.reduce((a, b) => a + Math.pow(b - (stats[feature]?.mean || 0), 2), 0) / values.length)
            };
        });

        // Normalize data and apply feature weights
        const normalizedData = data.map(song => {
            const normalized = {};
            featureNames.forEach(feature => {
                normalized[feature] = ((song[feature] - stats[feature].mean) / 
                    stats[feature].std) * this.featureWeights[feature];
            });
            return {
                ...song,
                normalizedFeatures: normalized
            };
        });

        console.log('Data preprocessing completed');
        return { normalizedData, stats };
    }

    fitGMM(data, K, maxIterations = 100, tolerance = 1e-6) {
        console.log(`Fitting GMM with K=${K}, maxIterations=${maxIterations}...`);
        
        // Preprocess data
        const { normalizedData, stats } = this.preprocessData(data);
        
        const N = normalizedData.length;
        const D = Object.keys(normalizedData[0].normalizedFeatures).length;
        
        // Initialize parameters
        const weights = Array(K).fill(1/K);
        const means = this.initializeMeans(normalizedData, K);
        const covariances = this.initializeCovariances(normalizedData, K, D);
        
        let oldLogLikelihood = -Infinity;
        let iterations = 0;
        
        while (iterations < maxIterations) {
            // E-step: Calculate responsibilities
            const responsibilities = this.calculateResponsibilities(
                normalizedData, 
                weights, 
                means, 
                covariances
            );
            
            // M-step: Update parameters
            this.updateParameters(
                normalizedData, 
                responsibilities, 
                weights, 
                means, 
                covariances
            );
            
            // Calculate log likelihood
            const logLikelihood = this.calculateLogLikelihood(
                normalizedData, 
                weights, 
                means, 
                covariances
            );
            
            // Check convergence
            if (Math.abs(logLikelihood - oldLogLikelihood) < tolerance) {
                console.log(`Converged after ${iterations} iterations`);
                break;
            }
            
            oldLogLikelihood = logLikelihood;
            iterations++;
            
            if (iterations % 10 === 0) {
                console.log(`Iteration ${iterations}, log likelihood: ${logLikelihood}`);
            }
        }

        return {
            weights,
            means,
            covariances,
            responsibilities: this.calculateResponsibilities(
                normalizedData, 
                weights, 
                means, 
                covariances
            ),
            logLikelihood: oldLogLikelihood,
            stats
        };
    }

    initializeMeans(data, K) {
        console.log('Initializing means using k-means++...');
        const means = [];
        
        // Select first centroid randomly
        const firstIdx = Math.floor(Math.random() * data.length);
        means.push(data[firstIdx].normalizedFeatures);
        
        // Select remaining centroids using k-means++
        while (means.length < K) {
            const distances = data.map(point => {
                const minDistance = Math.min(...means.map(mean => 
                    this.calculateDistance(point.normalizedFeatures, mean)
                ));
                return minDistance * minDistance;
            });
            
            // Normalize distances for numerical stability
            const maxDist = Math.max(...distances);
            const normalizedDist = distances.map(d => d / maxDist);
            
            // Select next centroid
            const sum = normalizedDist.reduce((a, b) => a + b, 0);
            const probs = normalizedDist.map(d => d / sum);
            
            let rand = Math.random();
            let index = 0;
            while (rand > 0 && index < probs.length) {
                rand -= probs[index];
                index++;
            }
            means.push(data[Math.max(0, index - 1)].normalizedFeatures);
        }
        
        return means;
    }

    initializeCovariances(data, K, D) {
        console.log('Initializing covariance matrices...');
        const covariances = [];
        const features = Object.keys(data[0].normalizedFeatures);
        
        // Calculate global covariance
        const globalCov = Array(D).fill().map(() => Array(D).fill(0));
        const mean = features.reduce((acc, feat) => {
            acc[feat] = data.reduce((sum, d) => sum + d.normalizedFeatures[feat], 0) / data.length;
            return acc;
        }, {});
        
        data.forEach(point => {
            features.forEach((feat1, i) => {
                features.forEach((feat2, j) => {
                    globalCov[i][j] += (point.normalizedFeatures[feat1] - mean[feat1]) * 
                                     (point.normalizedFeatures[feat2] - mean[feat2]);
                });
            });
        });
        
        // Normalize and initialize K covariance matrices
        for (let i = 0; i < D; i++) {
            for (let j = 0; j < D; j++) {
                globalCov[i][j] /= (data.length - 1);
            }
        }
        
        for (let k = 0; k < K; k++) {
            covariances.push(this.stabilizeCovariance(globalCov));
        }
        
        return covariances;
    }

    calculateResponsibilities(data, weights, means, covariances) {
        const N = data.length;
        const K = weights.length;
        const responsibilities = Array(N).fill().map(() => Array(K).fill(0));
        
        for (let n = 0; n < N; n++) {
            const point = data[n].normalizedFeatures;
            let maxLogProb = -Infinity;
            const logProbs = new Array(K);
            
            // Calculate log probabilities
            for (let k = 0; k < K; k++) {
                logProbs[k] = Math.log(weights[k]) + 
                    this.calculateLogGaussian(point, means[k], covariances[k]);
                maxLogProb = Math.max(maxLogProb, logProbs[k]);
            }
            
            // Calculate responsibilities using log-sum-exp trick
            let sumExp = 0;
            for (let k = 0; k < K; k++) {
                sumExp += Math.exp(logProbs[k] - maxLogProb);
            }
            const logSum = maxLogProb + Math.log(sumExp);
            
            for (let k = 0; k < K; k++) {
                responsibilities[n][k] = Math.exp(logProbs[k] - logSum);
            }
        }
        
        return responsibilities;
    }

    updateParameters(data, responsibilities, weights, means, covariances) {
        const N = data.length;
        const K = weights.length;
        const features = Object.keys(data[0].normalizedFeatures);
        
        // Calculate Nk (effective number of points in each cluster)
        const Nk = responsibilities.reduce((acc, r) => {
            r.forEach((resp, k) => acc[k] += resp);
            return acc;
        }, Array(K).fill(0));
        
        // Update weights
        weights.forEach((_, k) => {
            weights[k] = Nk[k] / N;
        });
        
        // Update means
        for (let k = 0; k < K; k++) {
            const newMean = {};
            features.forEach(feat => {
                newMean[feat] = 0;
                data.forEach((point, n) => {
                    newMean[feat] += responsibilities[n][k] * point.normalizedFeatures[feat];
                });
                newMean[feat] /= Nk[k];
            });
            means[k] = newMean;
        }
        
        // Update covariances
        for (let k = 0; k < K; k++) {
            const newCov = Array(features.length).fill()
                .map(() => Array(features.length).fill(0));
            
            data.forEach((point, n) => {
                features.forEach((feat1, i) => {
                    features.forEach((feat2, j) => {
                        const diff1 = point.normalizedFeatures[feat1] - means[k][feat1];
                        const diff2 = point.normalizedFeatures[feat2] - means[k][feat2];
                        newCov[i][j] += responsibilities[n][k] * diff1 * diff2;
                    });
                });
            });
            
            features.forEach((_, i) => {
                features.forEach((_, j) => {
                    newCov[i][j] /= Nk[k];
                });
            });
            
            covariances[k] = this.stabilizeCovariance(newCov);
        }
    }

    calculateLogLikelihood(data, weights, means, covariances) {
        return data.reduce((sum, point) => {
            const weightedProbs = weights.map((weight, k) => 
                weight * Math.exp(this.calculateLogGaussian(
                    point.normalizedFeatures, 
                    means[k], 
                    covariances[k]
                ))
            );
            return sum + Math.log(weightedProbs.reduce((a, b) => a + b, 0));
        }, 0);
    }

    calculateLogGaussian(point, mean, covariance) {
        const D = Object.keys(point).length;
        const diff = Object.keys(point).map(feature => 
            point[feature] - mean[feature]
        );
        
        const stabilizedCov = this.stabilizeCovariance(covariance);
        const logDet = Math.log(this.calculateDeterminant(stabilizedCov));
        const inv = this.calculateInverse(stabilizedCov);
        
        let quadForm = 0;
        for (let i = 0; i < D; i++) {
            for (let j = 0; j < D; j++) {
                quadForm += diff[i] * inv[i][j] * diff[j];
            }
        }
        
        return -0.5 * (D * Math.log(2 * Math.PI) + logDet + quadForm);
    }

    stabilizeCovariance(covariance, minVariance = 1e-6) {
        const D = covariance.length;
        const stabilized = Array(D).fill().map(() => Array(D).fill(0));
        
        for (let i = 0; i < D; i++) {
            for (let j = 0; j < D; j++) {
                if (i === j) {
                    stabilized[i][j] = Math.max(covariance[i][j], minVariance);
                } else {
                    stabilized[i][j] = covariance[i][j];
                }
            }
        }
        
        return stabilized;
    }

    calculateDeterminant(matrix) {
        const n = matrix.length;
        
        if (n === 1) return matrix[0][0];
        if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        
        let det = 1;
        const L = this.choleskyDecomposition(matrix);
        
        for (let i = 0; i < n; i++) {
            det *= L[i][i] * L[i][i];
        }
        
        return Math.max(det, Number.EPSILON);
    }

    choleskyDecomposition(matrix) {
        const n = matrix.length;
        const L = Array(n).fill().map(() => Array(n).fill(0));
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j <= i; j++) {
                let sum = 0;
                
                if (j === i) {
                    for (let k = 0; k < j; k++) {
                        sum += L[j][k] * L[j][k];
                    }
                    L[j][j] = Math.sqrt(Math.max(matrix[j][j] - sum, Number.EPSILON));
                } else {
                    for (let k = 0; k < j; k++) {
                        sum += L[i][k] * L[j][k];
                    }
                    L[i][j] = (matrix[i][j] - sum) / L[j][j];
                }
            }
        }
        
        return L;
    }

    calculateInverse(matrix) {
        const n = matrix.length;
        const L = this.choleskyDecomposition(matrix);
        const inv = Array(n).fill().map(() => Array(n).fill(0));
        
        // Solve L * L^T * X = I
        for (let i = 0; i < n; i++) {
            // Solve L * y = e_i
            const y = Array(n).fill(0);
            for (let j = 0; j < n; j++) {
                let sum = 0;
                for (let k = 0; k < j; k++) {
                    sum += L[j][k] * y[k];
                }
                y[j] = (i === j ? 1 : 0) - sum;
                y[j] /= L[j][j];
            }
            
            // Solve L^T * x = y
            for (let j = n - 1; j >= 0; j--) {
                let sum = 0;
                for (let k = j + 1; k < n; k++) {
                    sum += L[k][j] * inv[i][k];
                }
                inv[i][j] = y[j] - sum;
                inv[i][j] /= L[j][j];
            }
        }
        
        return inv;
    }

// Continuing from evaluateClustering...
evaluateClustering(data, K) {
    try {
        console.log(`\nEvaluating clustering with K=${K}...`);
        const gmmResult = this.fitGMM(data, K);
        
        // Get cluster assignments
        const clusters = gmmResult.responsibilities.map(r => 
            r.indexOf(Math.max(...r))
        );
        
        // Calculate evaluation metrics
        const silhouetteScore = this.calculateSilhouetteScore(data, clusters, gmmResult.means);
        const dbiScore = this.calculateDBI(data, clusters, gmmResult.means);
        const bicScore = this.calculateBIC(data, gmmResult, K);
        const aicScore = this.calculateAIC(gmmResult, K);
        
        // Store metrics
        const timestamp = new Date();
        this.metrics.silhouette.push({ timestamp, value: silhouetteScore });
        this.metrics.dbi.push({ timestamp, value: dbiScore });
        this.metrics.bic.push({ timestamp, value: bicScore });
        this.metrics.aic.push({ timestamp, value: aicScore });
        this.metrics.logLikelihood.push({ 
            timestamp, 
            value: gmmResult.logLikelihood 
        });
        
        return {
            gmmResult,
            metrics: {
                silhouetteScore,
                dbiScore,
                bicScore,
                aicScore,
                logLikelihood: gmmResult.logLikelihood
            },
            clusters
        };
    } catch (error) {
        console.error('Error in evaluateClustering:', error);
        throw error;
    }
}

calculateSilhouetteScore(data, clusters, means) {
    const N = data.length;
    let totalScore = 0;
    
    for (let i = 0; i < N; i++) {
        const a = this.calculateIntraClusterDistance(data[i], data, clusters, clusters[i]);
        const b = this.calculateMinInterClusterDistance(data[i], data, clusters, clusters[i]);
        
        const silhouetteScore = b !== a ? 
            (b - a) / Math.max(a, b) : 0;
            
        totalScore += silhouetteScore;
    }
    
    return totalScore / N;
}

calculateIntraClusterDistance(point, data, clusters, clusterIndex) {
    const clusterPoints = data.filter((_, i) => clusters[i] === clusterIndex);
    if (clusterPoints.length <= 1) return 0;
    
    const distances = clusterPoints
        .filter(p => p !== point)
        .map(p => this.calculateDistance(
            this.getNumericFeatures(point), 
            this.getNumericFeatures(p)
        ));
        
    return this.calculateAverage(distances);
}

calculateMinInterClusterDistance(point, data, clusters, clusterIndex) {
    const otherClusters = [...new Set(clusters)].filter(c => c !== clusterIndex);
    
    const averageDistances = otherClusters.map(cluster => {
        const clusterPoints = data.filter((_, i) => clusters[i] === cluster);
        const distances = clusterPoints.map(p =>
            this.calculateDistance(
                this.getNumericFeatures(point), 
                this.getNumericFeatures(p)
            )
        );
        return this.calculateAverage(distances);
    });
    
    return Math.min(...averageDistances);
}

calculateDBI(data, clusters, means) {
    const K = means.length;
    let dbi = 0;
    
    // Calculate average distances within clusters
    const avgDistances = {};
    const uniqueClusters = [...new Set(clusters)];
    
    uniqueClusters.forEach(cluster => {
        const clusterPoints = data.filter((_, i) => clusters[i] === cluster);
        avgDistances[cluster] = this.calculateAverageClusterDistance(
            clusterPoints, 
            means[cluster]
        );
    });

    // Calculate DBI
    for (let i = 0; i < K; i++) {
        let maxRatio = 0;
        for (let j = 0; j < K; j++) {
            if (i !== j) {
                const centerDist = this.calculateDistance(means[i], means[j]);
                if (centerDist > 0) {
                    const ratio = (avgDistances[i] + avgDistances[j]) / centerDist;
                    maxRatio = Math.max(maxRatio, ratio);
                }
            }
        }
        dbi += maxRatio;
    }

    return dbi / K;
}

calculateBIC(data, gmmResult, K) {
    const N = data.length;
    const D = Object.keys(this.getNumericFeatures(data[0])).length;
    const numParameters = K * (1 + D + D * D); // weights + means + covariances
    
    return -2 * gmmResult.logLikelihood + numParameters * Math.log(N);
}

calculateAIC(gmmResult, K) {
    const D = Object.keys(gmmResult.means[0]).length;
    const numParameters = K * (1 + D + D * D);
    
    return -2 * gmmResult.logLikelihood + 2 * numParameters;
}

getNumericFeatures(song) {
    const numericFeatures = {};
    ['danceability', 'energy', 'tempo', 'valence', 'acousticness'].forEach(feature => {
        if (typeof song[feature] === 'number') {
            numericFeatures[feature] = song[feature];
        }
    });
    return numericFeatures;
}

calculateDistance(a, b) {
    return Math.sqrt(
        Object.keys(a).reduce((sum, feature) => {
            const diff = a[feature] - b[feature];
            return sum + diff * diff;
        }, 0)
    );
}

calculateAverageClusterDistance(points, center) {
    return this.calculateAverage(
        points.map(point => 
            this.calculateDistance(this.getNumericFeatures(point), center)
        )
    );
}

calculateAverage(array) {
    return array.length ? array.reduce((a, b) => a + b, 0) / array.length : 0;
}

generateReport() {
    return {
        clusteringQuality: {
            silhouette: {
                latest: this.metrics.silhouette[this.metrics.silhouette.length - 1],
                history: this.metrics.silhouette,
                trend: this.calculateTrend(this.metrics.silhouette.map(s => s.value))
            },
            dbi: {
                latest: this.metrics.dbi[this.metrics.dbi.length - 1],
                history: this.metrics.dbi,
                trend: this.calculateTrend(this.metrics.dbi.map(d => d.value))
            }
        },
        modelSelection: {
            bic: {
                latest: this.metrics.bic[this.metrics.bic.length - 1],
                history: this.metrics.bic,
                trend: this.calculateTrend(this.metrics.bic.map(b => b.value))
            },
            aic: {
                latest: this.metrics.aic[this.metrics.aic.length - 1],
                history: this.metrics.aic,
                trend: this.calculateTrend(this.metrics.aic.map(a => a.value))
            }
        }
    };
}

calculateTrend(values) {
    if (values.length < 2) return 'insufficient data';
    const last = values[values.length - 1];
    const previous = values[values.length - 2];
    const change = ((last - previous) / previous) * 100;
    return {
        direction: change > 0 ? 'increasing' : 'decreasing',
        percentage: Math.abs(change)
    };
}
}
