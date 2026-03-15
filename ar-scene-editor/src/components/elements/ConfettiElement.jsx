import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * ConfettiElement - Renders EITHER burst OR rain particles.
 * The emitterType prop determines which variant to render.
 * Each variant is a separate element in the hierarchy with its own Transform.
 */
export const ConfettiElement = ({
    isSelected,
    opacity = 1,
    emitterType = 'burst', // 'burst' or 'rain'
    // Shared props
    particleCount = 80,
    particleSpeed = 1.5,
    particleSize = 0.08,
    confettiDuration = 6,
    confettiColors = ['#E30613', '#FFD700', '#FFFFFF', '#00A651', '#0080FF', '#FF6B00']
}) => {
    const pointsRef = useRef()
    const timeRef = useRef(0)
    const isBurst = emitterType === 'burst'

    const { initialPositions, colorArray, velocities } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3)
        const colArr = new Float32Array(particleCount * 3)
        const vels = []
        const colorObj = new THREE.Color()
        const parsedColors = Array.isArray(confettiColors) ? confettiColors : ['#E30613', '#FFD700', '#FFFFFF']

        for (let i = 0; i < particleCount; i++) {
            if (isBurst) {
                positions[i * 3] = 0
                positions[i * 3 + 1] = 0
                positions[i * 3 + 2] = 0.05

                const theta = Math.random() * Math.PI * 2
                const phi = Math.random() * Math.PI - Math.PI / 2
                const speed = (0.3 + Math.random() * 0.7) * particleSpeed
                vels.push({
                    x: Math.cos(theta) * Math.cos(phi) * speed * 0.5,
                    y: Math.sin(phi) * speed * 0.4 + 0.6,
                    z: Math.sin(theta) * Math.cos(phi) * speed * 0.12,
                    gravity: 1.0 + Math.random() * 0.5,
                    spin: (Math.random() - 0.5) * 5,
                    delay: 0
                })
            } else {
                positions[i * 3] = (Math.random() - 0.5) * 1.5
                positions[i * 3 + 1] = 0.8 + Math.random() * 0.8
                positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2

                vels.push({
                    x: (Math.random() - 0.5) * 0.1,
                    y: -(0.15 + Math.random() * particleSpeed),
                    z: (Math.random() - 0.5) * 0.03,
                    gravity: 0.12 + Math.random() * 0.1,
                    spin: (Math.random() - 0.5) * 4,
                    delay: Math.random() * 2.5
                })
            }

            colorObj.set(parsedColors[Math.floor(Math.random() * parsedColors.length)])
            colArr[i * 3] = colorObj.r
            colArr[i * 3 + 1] = colorObj.g
            colArr[i * 3 + 2] = colorObj.b
        }

        return {
            initialPositions: new Float32Array(positions),
            colorArray: colArr,
            velocities: vels
        }
    }, [particleCount, particleSpeed, isBurst, JSON.stringify(confettiColors)])

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3))
        geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))
        return geo
    }, [particleCount, colorArray])

    const material = useMemo(() => {
        return new THREE.PointsMaterial({
            size: particleSize,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            depthWrite: false,
            sizeAttenuation: true
        })
    }, [particleSize])

    const liveVels = useRef([])

    useFrame((_, delta) => {
        if (!pointsRef.current) return

        timeRef.current += delta
        const t = timeRef.current

        if (t > confettiDuration) {
            timeRef.current = 0
            const pos = pointsRef.current.geometry.attributes.position
            pos.array.set(initialPositions)
            pos.needsUpdate = true
            liveVels.current = velocities.map(v => ({ ...v }))
            material.opacity = 1
            return
        }

        if (liveVels.current.length === 0) {
            liveVels.current = velocities.map(v => ({ ...v }))
            const pos = pointsRef.current.geometry.attributes.position
            pos.array.set(initialPositions)
            pos.needsUpdate = true
        }

        const pos = pointsRef.current.geometry.attributes.position

        for (let i = 0; i < particleCount; i++) {
            const vel = liveVels.current[i]
            if (!vel) continue
            if (!isBurst && t < vel.delay) continue

            pos.array[i * 3] += vel.x * delta
            pos.array[i * 3 + 1] += vel.y * delta
            pos.array[i * 3 + 2] += vel.z * delta

            vel.y -= vel.gravity * delta
            vel.x *= (1 - 0.4 * delta)
            vel.z *= (1 - 0.4 * delta)

            const effectiveTime = isBurst ? t : t - vel.delay
            pos.array[i * 3] += Math.sin(effectiveTime * vel.spin) * 0.002
        }

        pos.needsUpdate = true

        const fadeStart = confettiDuration - 1.5
        if (t > fadeStart) {
            material.opacity = Math.max(0, 1 - (t - fadeStart) / 1.5)
        } else {
            material.opacity = opacity
        }
    })

    return (
        <group>
            <points ref={pointsRef} geometry={geometry} material={material}
                frustumCulled={false} renderOrder={999}
            />
            {isSelected && (
                <mesh>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color={isBurst ? '#ff5722' : '#2196f3'} wireframe />
                </mesh>
            )}
        </group>
    )
}
