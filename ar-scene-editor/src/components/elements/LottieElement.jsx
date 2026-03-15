import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * LottieElement - Renders a Lottie animation as a real 3D plane using CanvasTexture.
 * This ensures proper z-ordering (depth) with other 3D objects in the scene.
 * Uses lottie-web canvas renderer. Forces ddd:0 to ensure canvas compatibility
 * with After Effects exports that use 3D layers.
 * Supports optional flagWave effect (vertex displacement).
 */
export const LottieElement = ({
    url, isSelected, loop = true, opacity = 1, previewTime = null, appearAt = 0,
    flagWave = false, flagAmplitude = 0.15, flagFrequency = 3, flagSpeed = 2
}) => {
    const lottieSrc = url ? `/${url}` : '/animations/animacion.json'
    const textureRef = useRef(null)
    const animRef = useRef(null)
    const canvasRef = useRef(null)
    const containerRef = useRef(null)
    const meshRef = useRef(null)
    const [ready, setReady] = useState(false)
    const wasPreviewRef = useRef(false)
    const timeRef = useRef(0)

    // Subdivided geometry for flag wave (32x32 segments, or simple 1x1 if no wave)
    const geometry = useMemo(() => {
        if (flagWave) {
            return new THREE.PlaneGeometry(1, 1, 32, 32)
        }
        return new THREE.PlaneGeometry(1, 1)
    }, [flagWave])

    useEffect(() => {
        const loadLottie = async () => {
            let lottieLib
            try {
                const mod = await import('lottie-web')
                lottieLib = mod.default
            } catch (e) {
                console.error('LottieElement: lottie-web not available', e)
                return
            }

            // Fetch the animation data
            let animData
            try {
                const res = await fetch(lottieSrc)
                animData = await res.json()
            } catch (e) {
                console.error('LottieElement: Failed to fetch lottie JSON', e)
                return
            }

            const w = animData.w || 512
            const h = animData.h || 512

            // Force ddd:0 - canvas renderer doesn't support 3D layers from After Effects.
            animData.ddd = 0
            if (animData.layers) {
                animData.layers.forEach(layer => { layer.ddd = 0 })
            }

            // Create an offscreen container for lottie-web canvas renderer
            const container = document.createElement('div')
            container.style.position = 'absolute'
            container.style.top = '-9999px'
            container.style.left = '-9999px'
            container.style.width = w + 'px'
            container.style.height = h + 'px'
            container.style.visibility = 'hidden'
            document.body.appendChild(container)
            containerRef.current = container

            // Fix asset image paths
            const baseDir = lottieSrc.substring(0, lottieSrc.lastIndexOf('/') + 1)
            if (animData.assets) {
                animData.assets.forEach(asset => {
                    if (asset.u && asset.p) {
                        asset.u = baseDir + asset.u
                    }
                })
            }

            const anim = lottieLib.loadAnimation({
                container,
                renderer: 'canvas',
                loop: loop,
                autoplay: previewTime === null,
                animationData: animData,
                rendererSettings: {
                    preserveAspectRatio: 'xMidYMid meet',
                    clearCanvas: true,
                    dpr: 1
                }
            })

            anim.addEventListener('DOMLoaded', () => {
                const lottieCanvas = container.querySelector('canvas')
                if (lottieCanvas) {
                    lottieCanvas.width = w
                    lottieCanvas.height = h
                    canvasRef.current = lottieCanvas

                    const tex = new THREE.CanvasTexture(lottieCanvas)
                    tex.colorSpace = THREE.SRGBColorSpace
                    textureRef.current = tex
                    setReady(true)
                    console.log('LottieElement: Canvas ready', w, 'x', h)
                } else {
                    console.error('LottieElement: Canvas not found after DOMLoaded')
                }
            })

            animRef.current = anim
        }

        loadLottie()

        return () => {
            if (animRef.current) {
                animRef.current.destroy()
                animRef.current = null
            }
            if (containerRef.current) {
                containerRef.current.remove()
                containerRef.current = null
            }
            if (textureRef.current) {
                textureRef.current.dispose()
                textureRef.current = null
            }
        }
    }, [lottieSrc])

    // Handle loop property changes dynamically
    useEffect(() => {
        if (animRef.current && previewTime === null) {
            animRef.current.loop = loop
            if (loop) {
                animRef.current.play()
            }
        }
    }, [loop])

    // Sync animation with timeline preview + flag wave vertex animation
    useFrame((_, delta) => {
        const anim = animRef.current
        if (!anim || !textureRef.current || !canvasRef.current) return

        if (previewTime !== null) {
            if (!wasPreviewRef.current) {
                anim.pause()
                wasPreviewRef.current = true
            }

            const totalFrames = anim.totalFrames
            const fps = anim.frameRate || 30
            const animDuration = totalFrames / fps
            const elapsed = previewTime - appearAt

            if (elapsed < 0) {
                anim.goToAndStop(0, true)
            } else if (!loop && elapsed >= animDuration) {
                anim.goToAndStop(totalFrames - 1, true)
            } else {
                const progress = loop
                    ? (elapsed % animDuration) / animDuration
                    : elapsed / animDuration
                const frame = Math.min(Math.floor(progress * totalFrames), totalFrames - 1)
                anim.goToAndStop(frame, true)
            }
        } else {
            if (wasPreviewRef.current) {
                wasPreviewRef.current = false
                anim.loop = loop
                anim.play()
            }
        }

        textureRef.current.needsUpdate = true

        // Flag wave vertex displacement
        if (flagWave && meshRef.current) {
            timeRef.current += delta
            const geo = meshRef.current.geometry
            const pos = geo.attributes.position
            const t = timeRef.current
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i)
                const y = pos.getY(i)
                // Pin left edge (x ≈ -0.5), wave increases toward right edge
                const waveStrength = (x + 0.5) // 0 at left, 1 at right
                const z = Math.sin(x * flagFrequency * Math.PI + t * flagSpeed * Math.PI)
                    * flagAmplitude * waveStrength
                    + Math.sin(y * 2 + t * flagSpeed * 1.3) * flagAmplitude * 0.3 * waveStrength
                pos.setZ(i, z)
            }
            pos.needsUpdate = true
            geo.computeVertexNormals()
        }
    })

    if (!ready) {
        return (
            <mesh>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial color="#ffeb3b" wireframe />
            </mesh>
        )
    }

    return (
        <group>
            <mesh ref={meshRef} geometry={geometry}>
                <meshBasicMaterial
                    map={textureRef.current}
                    transparent={true}
                    opacity={opacity}
                    side={THREE.DoubleSide}
                    depthWrite={opacity >= 1}
                />
            </mesh>

            {/* Selection indicator */}
            {isSelected && (
                <mesh>
                    <planeGeometry args={[1.05, 1.05]} />
                    <meshBasicMaterial color="#ffeb3b" wireframe />
                </mesh>
            )}
        </group>
    )
}
