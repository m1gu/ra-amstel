import React, { Suspense, useRef } from 'react'
import { useGLTF, Box } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

// Utilidad: forzar un material individual a ser 100% opaco
const forceOpaque = (mat) => {
    mat.transparent = false
    mat.opacity = 1
    mat.alphaTest = 0
    mat.depthWrite = true
    mat.side = 0 // FrontSide only (evita caras interiores transparentes)
    if (mat.alphaMap) mat.alphaMap = null
    // Si la textura base tiene canal alpha, deshabilitamos su uso como transparencia
    if (mat.map && mat.map.premultiplyAlpha) {
        mat.map.premultiplyAlpha = false
        mat.map.needsUpdate = true
    }
    mat.needsUpdate = true
    return mat
}

// Sub-component to load the actual model so we can wrap it in Suspense
const ModelLoader = ({ url }) => {
    const { scene } = useGLTF(`/${url}`)
    const cloned = scene.clone()

    // Deep-clone de materiales + forzar opacidad completa
    cloned.traverse((child) => {
        if (child.isMesh) {
            if (Array.isArray(child.material)) {
                // Multi-material: clonar cada uno
                child.material = child.material.map(m => forceOpaque(m.clone()))
            } else if (child.material) {
                // Material único: clonar y forzar opaco
                child.material = forceOpaque(child.material.clone())
            }
        }
    })

    return <primitive object={cloned} />
}

export const Model3DElement = ({ url, isSelected, autoRotate = false, autoRotateSpeed = 1, opacity = 1 }) => {
    const isLoadable = url && (url.endsWith('.gltf') || url.endsWith('.glb'))
    const groupRef = useRef()
    const outerRef = useRef()

    // Auto-rotation + opacity control
    useFrame((_, delta) => {
        if (autoRotate && groupRef.current) {
            groupRef.current.rotation.y += delta * autoRotateSpeed
        }
        // Apply opacity to all materials in the model
        if (outerRef.current) {
            outerRef.current.traverse((child) => {
                if (child.isMesh && child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material]
                    mats.forEach(mat => {
                        mat.transparent = opacity < 1
                        mat.opacity = opacity
                    })
                }
            })
        }
    })

    return (
        <group ref={outerRef}>
            {isLoadable ? (
                <Suspense fallback={<Box args={[1, 1, 1]}><meshStandardMaterial color="#03a9f4" wireframe /></Box>}>
                    <group ref={groupRef}>
                        <ModelLoader url={url} />
                    </group>
                </Suspense>
            ) : (
                // Fallback box for arbitrary formats or missing URL
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#03a9f4" />
                </mesh>
            )}

            {/* Highlight box */}
            {isSelected && (
                <mesh>
                    <boxGeometry args={[1.1, 1.1, 1.1]} />
                    <meshBasicMaterial color="#fff" wireframe />
                </mesh>
            )}
        </group>
    )
}
