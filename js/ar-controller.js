import { AnimationPlayer } from './animation-player.js';
import { VideoPlayer } from './video-player.js';

export class ARController {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.mindarThree = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.animationPlayer = new AnimationPlayer();
        this.videoPlayer = new VideoPlayer();
        this.lottiePlane = null;
        this.lottieTexture = null;
        this.videoPlane = null;
    }

    async start() {
        console.log("Comprobando disponibilidad de MindAR...");

        let retryCount = 0;
        while (!window.MINDAR?.IMAGE?.MindARThree && retryCount < 10) {
            console.warn(`MindAR no listo (intento ${retryCount + 1}). Reintentando...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            retryCount++;
        }

        if (!window.MINDAR?.IMAGE?.MindARThree) {
            throw new Error("MindARThree not found");
        }

        // --- SOLUCIÓN PUNTO 1: Sincronización de Instancias ---
        // Usamos EXCLUSIVAMENTE la instancia de Three.js que viene dentro de MindAR
        // Esto garantiza que los objetos sean visibles para su motor de renderizado.
        const THREE = window.MINDAR.IMAGE.THREE;
        // -----------------------------------------------------

        try {
            await this.animationPlayer.load('./assets/animations/animacion.json');
        } catch (e) {
            console.error("No se pudo cargar la animación Lottie:", e);
        }

        // Cargar el Video
        try {
            await this.videoPlayer.load('./assets/videos/video-goles.mp4');
        } catch (e) {
            console.error("No se pudo cargar el video MP4:", e);
        }

        // Inicializar MindAR con Three.js
        this.mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: this.container,
            imageTargetSrc: './assets/markers/targets.mind',
            uiLoading: "no",
            uiScanning: "no"
        });

        const { renderer, scene, camera } = this.mindarThree;
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        // Crear el plano para la animación Lottie
        const canvas = this.animationPlayer.getCanvas();
        this.lottieTexture = new THREE.CanvasTexture(canvas);

        // Aumentamos el tamaño inicial para que sea visible (Fase 3 Fix)
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
            map: this.lottieTexture,
            transparent: true,
            side: THREE.BackSide // Algunas veces el orden de caras afecta en AR
        });

        // Creamos un plano con DoubleSide para asegurar visibilidad
        const materialDouble = new THREE.MeshBasicMaterial({
            map: this.lottieTexture,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false
        });

        this.lottiePlane = new THREE.Mesh(geometry, materialDouble);
        this.lottiePlane.visible = false;

        // Aplicamos un micro-ajuste de posición (X: compensar izquierda, Y: centrado)
        this.lottiePlane.position.set(0.05, 0, 0.5);
        this.lottiePlane.renderOrder = 999;

        // Crear el plano para el Video (Fase 4)
        const videoTexture = this.videoPlayer.getTexture();
        // El video suele ser 16:9, ajustamos escala
        const videoGeometry = new THREE.PlaneGeometry(1, 0.5625);
        const videoMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            transparent: true, // Por si el video tiene fondo pero se desea blending
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false
        });

        this.videoPlane = new THREE.Mesh(videoGeometry, videoMaterial);
        this.videoPlane.visible = false;

        // Posicionar 50% más abajo que la animación
        // Bajamos a -1.2 para dar aire entre la copa y los goles
        this.videoPlane.position.set(0, -1.2, 0.1);
        this.videoPlane.renderOrder = 1000;

        const anchor = this.mindarThree.addAnchor(0);
        anchor.group.add(this.lottiePlane);
        anchor.group.add(this.videoPlane);

        anchor.onTargetFound = () => {
            console.log("Target detectado");
            document.getElementById('scan-hint').classList.add('hidden');

            // Pequeña espera para asegurar que el canvas de Lottie esté listo en memoria (móviles)
            setTimeout(() => {
                const canvas = this.animationPlayer.getCanvas();
                if (canvas && this.lottieTexture.image !== canvas) {
                    this.lottieTexture.image = canvas;
                }

                this.lottiePlane.visible = true;
                this.animationPlayer.play(() => {
                    console.log("Cambiando a video...");
                    this.videoPlane.visible = true;
                    this.videoPlayer.play();
                });
            }, 100);
        };

        anchor.onTargetLost = () => {
            console.log("Target perdido");
            document.getElementById('scan-hint').classList.remove('hidden');
            this.lottiePlane.visible = false;
            this.videoPlane.visible = false;
            this.videoPlayer.pause();
        };

        // Iniciar el motor AR
        await this.mindarThree.start();

        this.renderer.setAnimationLoop(() => {
            // Aseguramos que el plano de Lottie esté siempre al frente
            this.lottiePlane.position.z = 0.5;
            this.lottiePlane.renderOrder = 999;

            if (this.animationPlayer.update()) {
                this.lottieTexture.needsUpdate = true;
            }

            // El VideoTexture de Three.js se actualiza automáticamente,
            // pero podemos forzarlo si fuera necesario
            if (this.videoPlayer.update()) {
                // videoPlane visible y reproduciendo
            }

            this.renderer.render(this.scene, this.camera);
        });
    }

    stop() {
        if (this.mindarThree) {
            this.mindarThree.stop();
            this.renderer.setAnimationLoop(null);
        }
    }
}
