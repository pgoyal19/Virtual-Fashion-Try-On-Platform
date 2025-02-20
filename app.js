require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const tryonRoutes = require('./routes/tryon');
const cartRoutes = require('./routes/cart');
const contactRoutes = require('./routes/contact'); // Fixed import
const errorHandler = require('./middleware/errorHandler');
const Collection = require('./models/Collection');
const Product = require('./models/Product');
const nodemailer = require('nodemailer');

const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Connection Error:", err));

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/tryon', tryonRoutes);
app.use('/cart', cartRoutes);
app.use('/contact', contactRoutes); // Fixed

// Homepage route
app.get('/', async (req, res) => {
    try {
        const trendingOutfits = await Product.find({ trending: true }).limit(6);
        const featuredCollections = await Collection.find({ featured: true }).limit(4);
        
        res.render('home', {
            user: req.session.user || null,
            trendingOutfits,
            featuredCollections
        });
    } catch (error) {
        console.error("Error fetching homepage data:", error);
        res.status(500).render('error', { error: 'Server error' });
    }
});

// Try-On Page
app.get('/try-on', (req, res) => {
    const products = [
        { id: 1, name: 'T-Shirt', image: '/images/tshirt.jpg' },
        { id: 2, name: 'Jeans', image: '/images/jeans.jpg' }
    ];

    res.render('tryon', { products });
});

// Save Look Route
app.post('/save-look', (req, res) => {
    try {
        // Implement saving logic
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving look:', error);
        res.status(500).json({ success: false, error: 'Failed to save look' });
    }
});

// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Use environment variables for security
        pass: process.env.EMAIL_PASS
    }
});

// Contact Form Submission
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `Contact Form Submission from ${name}`,
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Email send error:", error);
            return res.status(500).send("Error sending email.");
        }
        console.log('Email sent:', info.response);
        res.send('Thank you for contacting us! We will get back to you soon.');
    });
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
