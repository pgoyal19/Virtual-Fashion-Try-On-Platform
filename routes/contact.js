const express = require('express');
const router = express.Router();

// GET Contact Page
router.get('/', (req, res) => {
    res.render('contact'); 
});

// POST Contact Form Submission
router.post('/', (req, res) => {
    const { name, email, message } = req.body;

    console.log(`Contact Form Submitted: Name: ${name}, Email: ${email}, Message: ${message}`);

    res.send('Thank you for contacting us! We will get back to you soon.');
});

module.exports = router;
