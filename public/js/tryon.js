let stream = null;
let currentCamera = 'user'; // 'user' for front camera, 'environment' for back camera

async function initializeCamera() {
    const videoElement = document.getElementById('camera-feed');
    const constraints = {
        video: {
            facingMode: currentCamera,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    try {
        // Stop any existing stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        // Get new stream
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        
        // Wait for video to be loaded
        await videoElement.play();
        
        // Initialize canvas with video dimensions
        const canvas = document.getElementById('overlay-canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please ensure you have granted camera permissions.');
    }
}

// Switch between front and back cameras
function switchCamera() {
    currentCamera = currentCamera === 'user' ? 'environment' : 'user';
    initializeCamera();
}

// Capture photo
function capturePhoto() {
    const video = document.getElementById('camera-feed');
    const canvas = document.getElementById('overlay-canvas');
    const context = canvas.getContext('2d');

    // Draw the current video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data
    const imageData = canvas.toDataURL('image/jpeg');

    // Get the selected product ID
    const productId = new URLSearchParams(window.location.search).get('productId');

    // Send to server for processing
    processImage(imageData, productId);
}

// Process captured image with virtual try-on
async function processImage(imageData, productId) {
    try {
        const response = await fetch('/tryon/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageData,
                clothingId: productId
            })
        });

        if (!response.ok) throw new Error('Processing failed');

        const result = await response.json();
        
        // Display processed image
        const canvas = document.getElementById('overlay-canvas');
        const context = canvas.getContext('2d');
        const processedImage = new Image();
        processedImage.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(processedImage, 0, 0, canvas.width, canvas.height);
        };
        processedImage.src = result.processedImage;
    } catch (error) {
        console.error('Error processing image:', error);
        alert('Failed to process image. Please try again.');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const switchCameraBtn = document.getElementById('switch-camera-btn');
    const captureBtn = document.getElementById('capture-btn');

    // Initialize camera when page loads
    initializeCamera();

    // Switch camera button
    switchCameraBtn?.addEventListener('click', switchCamera);

    // Capture button
    captureBtn?.addEventListener('click', capturePhoto);
});

// Clean up when leaving the page
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}); 