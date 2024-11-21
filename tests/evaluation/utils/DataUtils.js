// tests/evaluation/utils/DataUtils.js

export function calculateMean(array) {
    return array.length ? array.reduce((a, b) => a + b, 0) / array.length : 0;
}

export function calculateStandardDeviation(array, mean = null) {
    if (array.length <= 1) return 0;
    const avg = mean ?? calculateMean(array);
    const squareDiffs = array.map(value => {
        const diff = value - avg;
        return diff * diff;
    });
    return Math.sqrt(calculateMean(squareDiffs));
}

export function normalizeData(data, stats = null) {
    if (!stats) {
        stats = {};
        for (const key of Object.keys(data[0])) {
            if (typeof data[0][key] === 'number') {
                const values = data.map(item => item[key]);
                stats[key] = {
                    mean: calculateMean(values),
                    std: calculateStandardDeviation(values)
                };
            }
        }
    }

    return data.map(item => {
        const normalized = { ...item };
        for (const [key, stat] of Object.entries(stats)) {
            if (typeof item[key] === 'number') {
                normalized[key] = (item[key] - stat.mean) / (stat.std || 1);
            }
        }
        return normalized;
    });
}

export function calculateDistance(a, b, features) {
    return Math.sqrt(
        features.reduce((sum, feature) => {
            const diff = a[feature] - b[feature];
            return sum + diff * diff;
        }, 0)
    );
}

export async function saveResults(path, results) {
    try {
        await fs.writeFile(path, JSON.stringify(results, null, 2));
        console.log(`Results saved to ${path}`);
    } catch (error) {
        console.error('Error saving results:', error);
        throw error;
    }
}
