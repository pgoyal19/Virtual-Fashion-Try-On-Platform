const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');

// Get try-on page
router.get('/', auth, async (req, res) => {
    try {
        // Get all products for the outfit list
        const products = await Product.find();
        
        // Get selected product if productId is provided
        const selectedProduct = req.query.productId ? 
            await Product.findById(req.query.productId) : null;

        res.render('tryon', {
            user: req.session.user,
            products: products,
            selectedProduct: selectedProduct
        });
    } catch (error) {
        console.error('Error loading try-on page:', error);
        res.status(500).render('error', { 
            error: 'Failed to load try-on page. Please try again.' 
        });
    }
});

// Process try-on image
router.post('/process', auth, async (req, res) => {
    try {
        const { imageData, clothingId } = req.body;
        
        // Here you would integrate with your AI clothing overlay service
        // For now, just return the original image
        res.json({ processedImage: imageData });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Processing failed' });
    }
});

module.exports = router; 