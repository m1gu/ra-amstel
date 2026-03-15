import React, { useRef } from 'react'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const ImageElement = ({
    url,
    isSelected,
    opacity = 1,
    pulseScale = false,
    pulseTarget = 1.2,
    pulseSpeed = 0.5
}) => {
    const meshRef = useRef()

    // Attempt loading texture, using generic fallback on error or missing URL
    const texture = useTexture(url || '/assets/images/placeholder.png', (tx) => {
        tx.colorSpace = THREE.SRGBColorSpace
    })

    // Get the aspect ratio of the loaded image to size the plane correctly
    const aspect = texture.image ? texture.image.width / texture.image.height : 1

    // Update the pulse scale on every frame
    useFrame((state) => {
        if (!meshRef.current) return

        if (pulseScale) {
            // Calculate pulse using a sine wave based on total elapsed time
            // Sine goes from -1 to 1. We remap it to 0 to 1.
            const t = state.clock.elapsedTime * pulseSpeed * Math.PI * 2
            const pulseFactor = (Math.sin(t) + 1) / 2

            // Interpolate between base scale (1.0) and target scale
            const currentScale = 1.0 + (pulseTarget - 1.0) * pulseFactor
            meshRef.current.scale.set(currentScale, currentScale, currentScale)
        } else {
            // Reset to base 1, 1, 1 when disabled (the group wrapper handles the user-defined transform scale)
            meshRef.current.scale.set(1, 1, 1)
        }
    })

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[aspect, 1]} />
            <meshBasicMaterial
                map={texture}
                transparent={true}
                opacity={opacity}
                side={THREE.DoubleSide}
                depthWrite={false}
                toneMapped={false}
            />
            {isSelected && (
                <lineSegments>
                    <edgesGeometry args={[new THREE.PlaneGeometry(aspect, 1)]} />
                    <lineBasicMaterial color="#00ff00" depthTest={false} />
                </lineSegments>
            )}
        </mesh>
    )
}
