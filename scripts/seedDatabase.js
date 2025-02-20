require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Product = require('../models/Product');
const Collection = require('../models/Collection');

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Read JSON files
        const productsData = JSON.parse(
            await fs.readFile(path.join(__dirname, '../data/products.json'), 'utf-8')
        );
        const collectionsData = JSON.parse(
            await fs.readFile(path.join(__dirname, '../data/collections.json'), 'utf-8')
        );

        // Clear existing data
        await Product.deleteMany({});
        await Collection.deleteMany({});
        console.log('Cleared existing data');

        // Insert new data
        const products = await Product.insertMany(productsData.products);
        console.log('Products inserted');

        // Get product IDs for collections
        const productIds = products.map(product => product._id);

        // Update collections with product IDs
        const updatedCollections = collectionsData.collections.map(collection => ({
            ...collection,
            products: productIds.slice(0, 2) // Add first 2 products to each collection
        }));

        await Collection.insertMany(updatedCollections);
        console.log('Collections inserted');

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase(); 