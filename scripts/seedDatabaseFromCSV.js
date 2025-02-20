require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parse');
const Product = require('../models/Product');
const Collection = require('../models/Collection');

async function parseCSV(filePath) {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return new Promise((resolve, reject) => {
        csv.parse(fileContent, {
            columns: true,
            cast: true,
            cast_date: true,
            trim: true
        }, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Parse CSV files
        const products = await parseCSV(path.join(__dirname, '../data/products.csv'));
        const collections = await parseCSV(path.join(__dirname, '../data/collections.csv'));

        // Clear existing data
        await Product.deleteMany({});
        await Collection.deleteMany({});

        // Transform data (parse strings to arrays/objects where needed)
        const transformedProducts = products.map(product => ({
            ...product,
            images: JSON.parse(product.images),
            sizes: JSON.parse(product.sizes),
            colors: JSON.parse(product.colors)
        }));

        const transformedCollections = collections.map(collection => ({
            ...collection,
            products: JSON.parse(collection.products)
        }));

        // Insert new data
        await Product.insertMany(transformedProducts);
        await Collection.insertMany(transformedCollections);

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase(); 