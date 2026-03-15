/**
 * Animation Player - Handles Lottie animations using Canvas renderer for Three.js integration
 * Supports loop control and ddd:0 fix for After Effects 3D layers.
 */
export class AnimationPlayer {
    constructor() {
        this.animation = null;
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;
        this.canvas.height = 1024;
        this.isPlaying = false;
        this.loop = false; // Controlled by scenes.json
        this.onCompleteCallback = null;
    }

    async load(path, options = {}) {
        console.log("Cargando animación Lottie:", path);
        this.loop = options.loop !== undefined ? options.loop : false;

        try {
            const response = await fetch(path);
            const ad = await response.json();

            // Fix ddd:0 - canvas renderer doesn't support 3D layers
            ad.ddd = 0;
            if (ad.layers) {
                ad.layers.forEach(layer => { layer.ddd = 0; });
            }

            const width = ad.w || 1024;
            const height = ad.h || 1024;

            const containerId = `lottie-container-${Math.random().toString(36).substr(2, 9)}`;
            const container = document.createElement('div');
            container.id = containerId;
            container.style.position = 'absolute';
            container.style.top = '-9999px';
            container.style.left = '-9999px';
            container.style.width = width + 'px';
            container.style.height = height + 'px';
            container.style.visibility = 'hidden';
            document.body.appendChild(container);

            return new Promise((resolve, reject) => {
                this.animation = lottie.loadAnimation({
                    container: container,
                    renderer: 'canvas',
                    loop: this.loop,
                    autoplay: false,
                    animationData: ad,
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid meet',
                        clearCanvas: true
                    }
                });

                this.animation.addEventListener('DOMLoaded', () => {
                    const lottieCanvas = container.querySelector('canvas');
                    if (lottieCanvas) {
                        lottieCanvas.width = width;
                        lottieCanvas.height = height;
                        lottieCanvas.style.width = width + 'px';
                        lottieCanvas.style.height = height + 'px';
                        this.canvas = lottieCanvas;
                    }
                    console.log("Lottie: Animación lista. Loop:", this.loop, "Size:", width, "x", height);
                    resolve();
                });

                this.animation.addEventListener('complete', () => {
                    if (!this.loop) {
                        this.isPlaying = false;
                    }
                    if (this.onCompleteCallback) this.onCompleteCallback();
                });
            });
        } catch (e) {
            console.error("Error cargando Lottie:", e);
            throw e;
        }
    }

    play(onComplete = null) {
        if (!this.animation) return;
        this.onCompleteCallback = onComplete;
        this.isPlaying = true;
        this.animation.goToAndPlay(0);
        console.log("Lottie: Reproduciendo... Loop:", this.loop);
    }

    getCanvas() {
        return this.canvas;
    }

    update() {
        if (!this.animation || !this.canvas || this.canvas.width === 0) return true;
        return this.isPlaying;
    }
}
