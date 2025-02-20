const User = require('../models/User');
const Product = require('../models/Product');

class RecommendationService {
    async getUserPreferences(userId) {
        const user = await User.findById(userId);
        return {
            styles: user.preferences.style,
            colors: user.preferences.colors,
            sizes: user.preferences.sizes,
            measurements: user.measurements
        };
    }

    async getPersonalizedRecommendations(userId) {
        const preferences = await this.getUserPreferences(userId);
        
        // Get products matching user preferences
        const recommendations = await Product.find({
            $and: [
                { sizes: { $in: preferences.sizes } },
                { colors: { $in: preferences.colors } },
                // Add more complex matching logic here
            ]
        }).limit(10);

        // Sort by relevance score
        return this.calculateRelevanceScores(recommendations, preferences);
    }

    calculateRelevanceScores(products, preferences) {
        return products.map(product => {
            let score = 0;
            
            // Calculate style match
            const styleMatch = preferences.styles.filter(style => 
                product.category.toLowerCase().includes(style.toLowerCase())
            ).length;
            score += styleMatch * 2;

            // Calculate color match
            const colorMatch = preferences.colors.filter(color =>
                product.colors.includes(color)
            ).length;
            score += colorMatch;

            return {
                ...product.toObject(),
                relevanceScore: score
            };
        }).sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
}

module.exports = new RecommendationService(); 