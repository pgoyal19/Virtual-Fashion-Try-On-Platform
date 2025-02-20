class TryonInitializer {
    constructor(selectedProduct = null) {
        this.selectedProduct = selectedProduct;
        this.virtualFitting = null;
    }

    async initialize() {
        try {
            this.virtualFitting = new VirtualFitting();
            this.setupEventListeners();
            
            if (this.selectedProduct) {
                this.tryOnProduct(this.selectedProduct);
            }
        } catch (error) {
            console.error('Error initializing virtual fitting:', error);
            alert('Failed to initialize virtual try-on. Please refresh the page.');
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.try-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const outfitItem = btn.closest('.outfit-item');
                const productId = outfitItem.dataset.productId;
                const imageUrl = outfitItem.querySelector('img').src;
                
                this.tryOnProduct({ id: productId, imageUrl });
            });
        });
    }

    tryOnProduct(product) {
        this.virtualFitting.setOutfit({
            id: product.id,
            imageUrl: product.imageUrl
        });
    }
} 