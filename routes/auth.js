const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Login route
router.get('/login', (req, res) => {
    res.render('auth/login');
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };
        
        res.redirect('/');
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Register route
router.get('/register', (req, res) => {
    res.render('auth/register');
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        user = new User({
            username,
            email,
            password
        });
        
        await user.save();
        
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };
        
        res.json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 