/**
 * AssetManager - Gestor centralizado de carga y caché de recursos.
 * Evita duplicar texturas, videos y datos de Lottie en memoria.
 */
export class AssetManager {
    constructor() {
        this.textures = new Map();
        this.lottieData = new Map();
        this.videos = new Map();
        this.models = new Map(); // Nueva caché para modelos 3D
        this.three = null;
    }

    setThree(THREE) {
        this.three = THREE;
    }

    /**
     * Carga una textura o la recupera de la caché si ya existe.
     */
    async loadTexture(url) {
        if (this.textures.has(url)) {
            // console.log(`[AssetManager] Texture Cache Hit: ${url}`);
            return this.textures.get(url);
        }

        return new Promise((resolve) => {
            const loader = new this.three.TextureLoader();
            loader.load(url, (texture) => {
                const width = texture.image ? texture.image.width : 0;
                const height = texture.image ? texture.image.height : 0;
                
                console.log(`[AssetManager] Texture Loaded: ${url} (${width}x${height}px)`);
                
                // Alerta si la textura es gigantesca (VRAM killer)
                if (width > 2048 || height > 2048) {
                    console.warn(`[AssetManager] ¡ALERTA! Textura muy grande detectada: ${url}. Dimensiones: ${width}x${height}. Esto puede causar crashes.`);
                }

                if (this.three.SRGBColorSpace) texture.colorSpace = this.three.SRGBColorSpace;
                else if (this.three.sRGBEncoding) texture.encoding = this.three.sRGBEncoding;
                
                this.textures.set(url, texture);
                resolve(texture);
            }, undefined, (err) => {
                console.error(`[AssetManager] Error loading texture ${url}`, err);
                resolve(null);
            });
        });
    }

    /**
     * Carga el JSON de una animación Lottie o lo recupera de caché.
     */
    async loadLottieData(url) {
        if (this.lottieData.has(url)) {
            // console.log(`[AssetManager] Lottie Cache Hit: ${url}`);
            return JSON.parse(JSON.stringify(this.lottieData.get(url))); // clonar para evitar mutaciones accidentales
        }

        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log(`[AssetManager] Lottie JSON Loaded: ${url}`);
            this.lottieData.set(url, data);
            return JSON.parse(JSON.stringify(data));
        } catch (err) {
            console.error(`[AssetManager] Error loading Lottie JSON ${url}`, err);
            return null;
        }
    }

    /**
     * Carga un video HTML5 o lo recupera de caché.
     * Nota: En Three.js, es mejor compartir el elemento <video> si el contenido es idéntico.
     */
    async loadVideoElement(url) {
        if (this.videos.has(url)) {
            // console.log(`[AssetManager] Video Cache Hit: ${url}`);
            return this.videos.get(url);
        }

        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.setAttribute('webkit-playsinline', 'true');
            video.setAttribute('playsinline', 'true');
            video.setAttribute('crossorigin', 'anonymous');
            video.preload = 'auto';
            video.muted = true;
            video.src = url;
            video.load();

            video.oncanplaythrough = () => {
                console.log(`[AssetManager] Video Loaded: ${url}`);
                this.videos.set(url, video);
                resolve(video);
            };

            video.onerror = (err) => {
                console.error(`[AssetManager] Error loading video ${url}`, err);
                resolve(null);
            };
        });
    }

    /**
     * Carga un modelo GLTF o lo recupera de caché.
     * Al recuperar de caché, se clona la escena para poder usarse en múltiples lugares.
     */
    async loadGLTF(url, dracoPath = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/') {
        if (this.models.has(url)) {
            const cachedGltf = this.models.get(url);
            // IMPORTANTE: Clonamos la escena porque un objeto Three.js solo puede tener un padre.
            return cachedGltf.scene.clone();
        }

        // Necesitamos cargar GLTFLoader dinámicamente o asumimos que ya está disponible
        // Para este proyecto, ObjLoader ya importa GLTFLoader, pero aquí lo haremos via window si es posible
        // o simplemente procesamos la carga delegando en GLTFLoader.
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
        const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');

        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(dracoPath);
        loader.setDRACOLoader(dracoLoader);

        return new Promise((resolve, reject) => {
            loader.load(url, (gltf) => {
                console.log(`[AssetManager] 3D Model Loaded: ${url}`);
                this.models.set(url, gltf);
                resolve(gltf.scene.clone());
            }, undefined, (err) => {
                console.error(`[AssetManager] Error loading GLTF ${url}`, err);
                reject(err);
            });
        });
    }
}

// Singleton
export const assetManager = new AssetManager();
