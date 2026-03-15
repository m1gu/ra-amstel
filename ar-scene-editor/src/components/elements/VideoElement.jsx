import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const VideoElement = ({ url, isSelected, opacity = 1 }) => {
    const materialRef = useRef()
    const videoRef = useRef(null)
    const textureRef = useRef(null)
    const videoSrc = url ? `/${url}` : '/videos/video-goles.mp4'

    useEffect(() => {
        // Create video element in the DOM (required for loading/playing)
        const video = document.createElement('video')
        video.src = videoSrc
        video.crossOrigin = 'Anonymous'
        video.loop = true
        video.muted = true
        video.playsInline = true
        video.preload = 'auto'
        video.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none'
        document.body.appendChild(video)
        videoRef.current = video

        // Create VideoTexture immediately — it auto-updates from the video element
        const texture = new THREE.VideoTexture(video)
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.colorSpace = THREE.SRGBColorSpace
        textureRef.current = texture

        // Assign texture to the material directly (bypasses React re-render issues)
        if (materialRef.current) {
            materialRef.current.map = texture
            materialRef.current.needsUpdate = true
        }

        // Play when ready
        const onCanPlay = () => {
            video.play().catch(() => {
                // Retry on user interaction if autoplay blocked
                document.addEventListener('click', () => video.play().catch(() => { }), { once: true })
            })
        }
        video.addEventListener('canplay', onCanPlay, { once: true })

        return () => {
            video.removeEventListener('canplay', onCanPlay)
            video.pause()
            video.removeAttribute('src')
            video.load()
            if (video.parentNode) video.parentNode.removeChild(video)
            if (textureRef.current) {
                textureRef.current.dispose()
                textureRef.current = null
            }
            videoRef.current = null
        }
    }, [videoSrc])

    // Force the texture onto the material every frame until it sticks,
    // and mark it as needing update
    useFrame(() => {
        if (materialRef.current && textureRef.current) {
            if (materialRef.current.map !== textureRef.current) {
                materialRef.current.map = textureRef.current
                materialRef.current.needsUpdate = true
            }
            textureRef.current.needsUpdate = true
        }
    })

    return (
        <group>
            <mesh>
                <planeGeometry args={[1.77, 1]} />
                <meshBasicMaterial ref={materialRef} side={THREE.DoubleSide} transparent opacity={opacity} />
            </mesh>

            {/* Highlight box */}
            {isSelected && (
                <mesh>
                    <boxGeometry args={[1.8, 1.05, 0.05]} />
                    <meshBasicMaterial color="#f44336" wireframe />
                </mesh>
            )}
        </group>
    )
}
