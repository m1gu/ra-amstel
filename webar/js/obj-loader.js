import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { APP_CONFIG } from './config.js';

/**
 * ObjLoader - Wrapper para cargar Modelos GLTF dinámicos con soporte para Environment Map
 */
export class ObjLoader {
    constructor() {
        this.loader = new GLTFLoader();

        // Soporte para DRACO (Compresión) — Indispensable para Android si se usa en Blender
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        this.loader.setDRACOLoader(dracoLoader);

        this.envMap = null; // Se asigna desde ar-controller.js
    }

    /**
     * Asigna el environment map que se usará en los modelos cargados.
     * @param {THREE.Texture} envMap - Textura de entorno generada con PMREMGenerator
     */
    setEnvironmentMap(envMap) {
        this.envMap = envMap;
    }

    /**
     * Carga un modelo 3D desde una ruta de archivo
     * @param {string} path Ruta relativa al archivo .gltf o .glb
     * @returns {Promise<THREE.Group>} Promesa que resuelve con la escena del modelo
     */
    async load(path) {
        console.log("ObjLoader: Cargando modelo 3D...", path);
        return new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => {
                    console.log(`ObjLoader: Modelo ${path} cargado con éxito.`);
                    const model = gltf.scene;

                    // Estadísticas para Debug
                    let meshCount = 0;
                    model.traverse(c => { if (c.isMesh) meshCount++; });
                    console.log(`ObjLoader: El modelo tiene ${meshCount} mallas.`);

                    // Aplicar environment map + forceOpaque a materiales PBR
                    model.traverse((child) => {
                        if (child.isMesh && child.material) {
                            const mats = Array.isArray(child.material) ? child.material : [child.material];
                            mats.forEach(mat => {
                                try {
                                    if (this.envMap) {
                                        mat.envMap = this.envMap;
                                        mat.envMapIntensity = APP_CONFIG.lighting ? APP_CONFIG.lighting.envMapIntensity : 1.0;
                                    }
                                    // forceOpaque — misma lógica que el AR Scene Editor
                                    mat.transparent = false;
                                    mat.opacity = 1;
                                    mat.alphaTest = 0;
                                    mat.depthWrite = true;
                                    mat.side = 2; // DoubleSide - Soluciona problemas de mallas "huecas"
                                    if (mat.alphaMap) mat.alphaMap = null;
                                    mat.needsUpdate = true;
                                } catch (e) {
                                    console.warn("ObjLoader: Fallo al configurar material PBR, usando fallback básico.", e);
                                    child.material = new window.MINDAR.IMAGE.THREE.MeshStandardMaterial({ color: 0x888888 });
                                }
                            });
                        }
                    });

                    resolve(model);
                },
                undefined,
                (error) => {
                    console.error("ObjLoader: Error cargando el modelo 3D", error);
                    reject(error);
                }
            );
        });
    }
}
