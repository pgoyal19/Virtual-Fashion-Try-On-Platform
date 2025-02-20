class LoadingState {
    constructor() {
        this.overlay = this.createOverlay();
        this.spinner = this.createSpinner();
        document.body.appendChild(this.overlay);
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.style.display = 'none';
        return overlay;
    }

    createSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        this.overlay.appendChild(spinner);
        return spinner;
    }

    show(message = 'Loading...') {
        this.spinner.setAttribute('data-message', message);
        this.overlay.style.display = 'flex';
    }

    hide() {
        this.overlay.style.display = 'none';
    }
}

const loadingState = new LoadingState();
window.loadingState = loadingState; 