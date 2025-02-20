const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    price: {
        type: Number,
        required: true
    },
    images: [String],
    category: {
        type: String,
        required: true
    },
    sizes: [String],
    colors: [String],
    trending: {
        type: Boolean,
        default: false
    },
    modelData: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema); 