const axios = require('axios');
const sharp = require('sharp');

class ClothingOverlayService {
    constructor() {
        this.apiKey = process.env.AI_SERVICE_API_KEY;
        this.endpoint = process.env.AI_SERVICE_ENDPOINT;
    }

    async processImage(imageData, clothingId) {
        try {
            // Prepare image
            const processedImage = await this.prepareImage(imageData);
            
            // Get clothing template
            const clothingTemplate = await this.getClothingTemplate(clothingId);
            
            // Enhanced AI processing options
            const response = await axios.post(`${this.endpoint}/overlay`, {
                image: processedImage,
                clothing: clothingTemplate,
                options: {
                    fitToBody: true,
                    preserveTexture: true,
                    enhanceQuality: true,
                    shadowEffect: true,
                    wrinkleSimulation: true
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('AI processing error:', error);
            throw new Error('Failed to process image');
        }
    }

    async prepareImage(imageData) {
        // Remove data URL prefix
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Optimize image
        const optimizedImage = await sharp(buffer)
            .resize(1024, 1024, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toBuffer();

        return optimizedImage.toString('base64');
    }

    async getClothingTemplate(clothingId) {
        // Get clothing model from database
        const product = await Product.findById(clothingId);
        return product.modelData;
    }
}

module.exports = new ClothingOverlayService(); 