class VirtualFitting {
    constructor() {
        this.video = document.getElementById('camera-feed');
        this.canvas = new fabric.Canvas('overlay-canvas');
        this.bodyPixNet = null;
        this.currentOutfit = null;
        this.isInitialized = false;
        
        this.initialize().catch(error => {
            console.error('Failed to initialize VirtualFitting:', error);
            throw error;
        });
    }

    async initialize() {
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            });
            this.video.srcObject = stream;

            // Wait for video to be ready
            await new Promise(resolve => {
                this.video.onloadedmetadata = resolve;
            });

            // Load BodyPix model
            this.bodyPixNet = await bodyPix.load({
                architecture: 'MobileNetV1',
                outputStride: 16,
                multiplier: 0.75,
                quantBytes: 2
            });

            // Setup canvas size
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());

            // Start video processing
            this.processVideo();
            this.isInitialized = true;
        } catch (error) {
            console.error('Initialization error:', error);
            throw new Error('Failed to initialize camera and AI models');
        }
    }

    resizeCanvas() {
        this.canvas.setWidth(this.video.videoWidth);
        this.canvas.setHeight(this.video.videoHeight);
    }

    async processVideo() {
        if (!this.video.videoWidth) {
            requestAnimationFrame(() => this.processVideo());
            return;
        }

        // Get segmentation
        const segmentation = await this.bodyPixNet.segmentPerson(this.video);
        
        // Process frame
        this.processFrame(segmentation);

        // Continue processing
        requestAnimationFrame(() => this.processVideo());
    }

    async processFrame(segmentation) {
        if (!this.currentOutfit) return;

        // Clear canvas
        this.canvas.clear();

        // Get body keypoints
        const pose = await this.bodyPixNet.estimatePoses(this.video);
        if (pose.length === 0) return;

        const keypoints = pose[0].keypoints;
        
        // Calculate outfit position and scaling based on body measurements
        const shoulderLeft = keypoints.find(kp => kp.part === 'leftShoulder');
        const shoulderRight = keypoints.find(kp => kp.part === 'rightShoulder');
        const hip = keypoints.find(kp => kp.part === 'leftHip');
        const neck = keypoints.find(kp => kp.part === 'neck');

        if (!shoulderLeft || !shoulderRight || !hip || !neck) return;

        // Add outfit to canvas with improved positioning and scaling
        const outfitImage = await this.loadImage(this.currentOutfit.imageUrl);
        const outfitObj = new fabric.Image(outfitImage, {
            left: shoulderLeft.position.x,
            top: neck.position.y,
            width: shoulderRight.position.x - shoulderLeft.position.x,
            height: hip.position.y - neck.position.y,
            scaleX: 1.2, // Adjust for better fit
            scaleY: 1.2
        });

        // Apply segmentation mask for realistic overlay
        this.applySegmentationMask(outfitObj, segmentation);
        
        this.canvas.add(outfitObj);
        this.canvas.renderAll();
    }

    async loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    applySegmentationMask(outfitObj, segmentation) {
        const mask = new fabric.Image(segmentation.data, {
            left: outfitObj.left,
            top: outfitObj.top,
            width: outfitObj.width,
            height: outfitObj.height
        });

        outfitObj.clipPath = mask;
    }

    setOutfit(outfit) {
        this.currentOutfit = outfit;
    }
} 