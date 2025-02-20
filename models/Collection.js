const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    coverImage: String,
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    featured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Collection', collectionSchema); 