const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');
const Order = require('../models/Order');

router.post('/create-payment-intent', auth, async (req, res) => {
    try {
        const { items } = req.body;
        
        // Calculate total amount
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total * 100, // Convert to cents
            currency: 'usd'
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: 'Payment processing failed' });
    }
});

router.post('/confirm-order', auth, async (req, res) => {
    try {
        const { items, shippingAddress, paymentIntentId } = req.body;
        
        const order = new Order({
            userId: req.session.user.id,
            items,
            shippingAddress,
            paymentIntentId,
            status: 'processing'
        });

        await order.save();
        res.json({ message: 'Order confirmed', orderId: order._id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to confirm order' });
    }
});

module.exports = router; 