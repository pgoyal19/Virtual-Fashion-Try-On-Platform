const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get cart
router.get('/', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.session.user.id })
                            .populate('items.productId');
        
        if (!cart) {
            cart = new Cart({ userId: req.session.user.id, items: [] });
            await cart.save();
        }
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
    try {
        const { productId, quantity, size, color } = req.body;
        
        let cart = await Cart.findOne({ userId: req.session.user.id });
        if (!cart) {
            cart = new Cart({ userId: req.session.user.id, items: [] });
        }
        
        const existingItem = cart.items.find(item => 
            item.productId.toString() === productId &&
            item.size === size &&
            item.color === color
        );
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity, size, color });
        }
        
        cart.updatedAt = Date.now();
        await cart.save();
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// Update cart item
router.put('/update/:itemId', auth, async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ userId: req.session.user.id });
        
        const item = cart.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        item.quantity = quantity;
        cart.updatedAt = Date.now();
        await cart.save();
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// Remove item from cart
router.delete('/remove/:itemId', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.session.user.id });
        cart.items.pull(req.params.itemId);
        cart.updatedAt = Date.now();
        await cart.save();
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
});

module.exports = router; 