/**
 * Three.js Shim - Única fuente de verdad para Three.js en la WebAR.
 * Redirige todas las importaciones ESM al objeto global creado por MindAR.
 * Esto evita el error "Multiple instances of Three.js" y ahorra memoria.
 */

if (!window.MINDAR || !window.MINDAR.IMAGE || !window.MINDAR.IMAGE.THREE) {
    console.error("Three Shim: MindAR no detectado. Three.js no está disponible globalmente.");
}

const THREE = window.MINDAR.IMAGE.THREE;

export default THREE;

// Exportamos las clases comunes para facilitar 'destructuring'
export const {
    Scene,
    Group,
    Mesh,
    PlaneGeometry,
    BoxGeometry,
    MeshBasicMaterial,
    MeshStandardMaterial,
    CanvasTexture,
    TextureLoader,
    VideoTexture,
    Vector2,
    Raycaster,
    Clock,
    Color,
    AmbientLight,
    DirectionalLight,
    HemisphereLight,
    PMREMGenerator,
    Object3D,
    MathUtils
} = THREE;

// Verificamos si los espacios de color existen (Three r152+)
export const SRGBColorSpace = THREE.SRGBColorSpace || 'srgb';
export const sRGBEncoding = THREE.sRGBEncoding || 3001; 
