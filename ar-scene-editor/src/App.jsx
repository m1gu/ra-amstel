import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, TransformControls, Environment } from '@react-three/drei'
import { Camera, Trash2, Eye, EyeOff, PlusCircle, Video, Box, PlayCircle, Pointer, Sparkles } from 'lucide-react'
import { useSceneStore } from './hooks/useSceneStore'
import Inspector from './components/Inspector'
import Timeline from './components/Timeline'
import ErrorBoundary from './components/ErrorBoundary'
import AssetPickerDialog from './components/AssetPickerDialog'

import { LottieElement } from './components/elements/LottieElement'
import { VideoElement } from './components/elements/VideoElement'
import { Model3DElement } from './components/elements/Model3DElement'
import { CTAElement } from './components/elements/CTAElement'
import { ConfettiElement } from './components/elements/ConfettiElement'
import { ImageElement } from './components/elements/ImageElement'

function App() {
    const {
        scenes, activeSceneIndex, selectedId, previewTime,
        addScene, removeScene, switchScene, exportJSON, importJSON,
        addElement, removeElement, selectElement, toggleVisibility, updateElement
    } = useSceneStore()

    const activeScene = scenes[activeSceneIndex] || { elements: [] }
    const elements = activeScene.elements

    // Dialog state for real assets
    const [pickerState, setPickerState] = useState({ isOpen: false, type: null })

    // Para desactivar OrbitControls cuando se arrastra el TransformControls
    const [orbitEnabled, setOrbitEnabled] = useState(true)
    const fileInputRef = useRef(null)

    // Guards para TransformControls: previene actualizaciones espurias al cambiar de elemento
    const isDraggingRef = useRef(false)
    const selectedIdRef = useRef(selectedId)
    useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])

    const handleImport = (event) => {
        const file = event.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (e) => importJSON(e.target.result)
        reader.readAsText(file)
        event.target.value = null // reset input
    }

    const getIconForType = (type) => {
        switch (type) {
            case 'lottie': return <PlayCircle size={16} color="#ffeb3b" />
            case 'obj3d': return <Box size={16} color="#03a9f4" />
            case 'video': return <Video size={16} color="#f44336" />
            case 'image': return <Pointer size={16} color="#8bc34a" />
            case 'cta': return <Pointer size={16} color="#4caf50" />
            case 'confettiBurst': return <Sparkles size={16} color="#ff5722" />
            case 'confettiRain': return <Sparkles size={16} color="#2196f3" />
            default: return null
        }
    }

    const handleOpenPicker = (type) => {
        setPickerState({ isOpen: true, type })
    }

    const handleAssetSelected = (url) => {
        addElement(pickerState.type, url)
        setPickerState({ isOpen: false, type: null })
    }

    return (
        <div className="editor-container">
            {/* HEADER / TOOLBAR */}
            <header className="editor-header">
                <div className="logo">🎯 AR Scene Editor</div>
                <div className="scene-selectors" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                        value={activeSceneIndex}
                        onChange={(e) => switchScene(Number(e.target.value))}
                        style={{ width: '200px' }}
                    >
                        {scenes.map((s, i) => (
                            <option key={s.id} value={i}>{s.name} (Marker {s.targetImageIndex})</option>
                        ))}
                    </select>
                    <button className="icon-btn-small" onClick={addScene} title="Añadir Escena" style={{ background: '#333', padding: '0.3rem 0.5rem', border: '1px solid var(--border)', borderRadius: '4px', color: '#fff' }}>+</button>
                    <button className="icon-btn-small" onClick={() => removeScene(activeSceneIndex)} title="Eliminar Escena" disabled={scenes.length <= 1} style={{ background: '#333', padding: '0.3rem 0.5rem', border: '1px solid var(--border)', borderRadius: '4px', color: scenes.length <= 1 ? '#666' : '#ef4444' }}><Trash2 size={14} /></button>
                </div>
                <div className="actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="file" accept=".json" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImport} />
                    <button onClick={() => fileInputRef.current?.click()} style={{ background: 'transparent' }}>Importar</button>
                    <button className="btn-primary" onClick={exportJSON}>Exportar JSON</button>
                </div>
            </header>

            <div className="editor-main">
                {/* LEFT PANEL: HIERARCHY */}
                <aside className="panel hierarchy-panel">
                    <h3>Jerarquía</h3>
                    <div className="hierarchy-list">
                        <div className="list-item" style={{ borderLeft: '3px solid #888', color: '#aaa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Camera size={16} /> <span>Referencia Marker</span>
                        </div>

                        {elements.map((el) => (
                            <div
                                key={el.id}
                                className={`list-item ${selectedId === el.id ? 'selected' : ''}`}
                                onClick={() => selectElement(el.id)}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    borderLeft: selectedId === el.id ? '3px solid var(--accent)' : '3px solid transparent',
                                    backgroundColor: selectedId === el.id ? '#3a3a3a' : '#333',
                                    opacity: el.visible ? 1 : 0.5
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}>
                                    {getIconForType(el.type)}
                                    <span style={{ fontSize: '0.85rem' }}>{el.name}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); toggleVisibility(el.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                        {el.visible ? <Eye size={14} color="#aaa" /> : <EyeOff size={14} color="#666" />}
                                    </button>
                                    <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <Trash2 size={14} color="#ef4444" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '0.5rem', marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button className="add-btn" onClick={() => handleOpenPicker('lottie')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><PlayCircle size={14} /> Lottie</button>
                            <button className="add-btn" onClick={() => handleOpenPicker('obj3d')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Box size={14} /> 3D</button>
                            <button className="add-btn" onClick={() => handleOpenPicker('video')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Video size={14} /> Video</button>
                            <button className="add-btn" onClick={() => handleOpenPicker('image')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Pointer size={14} /> Imagen PNG</button>
                            <button className="add-btn" onClick={() => addElement('confettiBurst')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#3d1500', borderColor: '#ff5722' }}><Sparkles size={14} color="#ff5722" /> Explosión 💥</button>
                            <button className="add-btn" onClick={() => addElement('confettiRain')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#0d2137', borderColor: '#2196f3' }}><Sparkles size={14} color="#2196f3" /> Lluvia 🌧️</button>
                        </div>
                    </div>
                </aside>

                {/* CENTER: VIEWPORT 3D */}
                <main className="viewport-container">
                    <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
                        <color attach="background" args={['#202020']} />
                        <ambientLight intensity={0.8} />
                        <directionalLight position={[10, 10, 5]} intensity={1.5} />
                        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
                        <Environment preset="studio" />

                        <Grid infiniteGrid fadeDistance={20} cellColor="#6f6f6f" sectionColor="#9d4b4b" />

                        {/* Marker reference shadow - visual indicator of where the AR marker sits */}
                        {/* Standing upright like on a wall, front/back facing Z axis */}
                        <group position={[0, 0.5, 0]}>
                            {/* Shadow fill */}
                            <mesh>
                                <planeGeometry args={[1.5, 1]} />
                                <meshBasicMaterial color="#ffffff" transparent opacity={0.08} side={2} />
                            </mesh>
                            {/* Border outline */}
                            <mesh>
                                <planeGeometry args={[1.5, 1]} />
                                <meshBasicMaterial color="#03a9f4" wireframe transparent opacity={0.4} />
                            </mesh>
                            {/* Center crosshair lines */}
                            <mesh position={[0, 0, 0.001]}>
                                <planeGeometry args={[0.04, 1]} />
                                <meshBasicMaterial color="#03a9f4" transparent opacity={0.2} />
                            </mesh>
                            <mesh position={[0, 0, 0.001]}>
                                <planeGeometry args={[1.5, 0.04]} />
                                <meshBasicMaterial color="#03a9f4" transparent opacity={0.2} />
                            </mesh>
                        </group>

                        <OrbitControls makeDefault enabled={orbitEnabled} />

                        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                            <GizmoViewport axisColors={['#ff3653', '#8adb00', '#2c8fdf']} labelColor="black" />
                        </GizmoHelper>

                        {/* TransformControls for the selected object */}
                        {selectedId && elements.find(e => e.id === selectedId)?.ref && (
                            <TransformControls
                                object={elements.find(e => e.id === selectedId).ref}
                                mode="translate"
                                onMouseDown={() => {
                                    setOrbitEnabled(false)
                                    isDraggingRef.current = true
                                }}
                                onMouseUp={() => {
                                    setOrbitEnabled(true)
                                    // Delay clearing isDragging to allow final onChange to fire
                                    setTimeout(() => { isDraggingRef.current = false }, 50)
                                }}
                                onChange={(e) => {
                                    // Only update state during active drags - prevents
                                    // elements jumping when switching selection
                                    if (!isDraggingRef.current) return
                                    if (e.target && e.target.object) {
                                        const obj = e.target.object;
                                        const currentId = selectedIdRef.current;
                                        if (!currentId) return;
                                        updateElement(currentId, {
                                            position: [obj.position.x, obj.position.y, obj.position.z],
                                            rotation: [
                                                obj.rotation.x * (180 / Math.PI),
                                                obj.rotation.y * (180 / Math.PI),
                                                obj.rotation.z * (180 / Math.PI)
                                            ],
                                            scale: [obj.scale.x, obj.scale.y, obj.scale.z]
                                        });
                                    }
                                }}
                            />
                        )}

                        {/* Render elements dynamically */}
                        {elements.filter(el => el.visible).map(el => {
                            const isSelected = selectedId === el.id;

                            // Timeline preview: control visibility and opacity
                            let elementVisible = true
                            let elementOpacity = 1
                            if (previewTime !== null) {
                                const appearAt = el.appearAt || 0
                                const fadeIn = el.fadeInDuration || 0
                                if (previewTime < appearAt) {
                                    elementVisible = false
                                } else if (fadeIn > 0 && previewTime < appearAt + fadeIn) {
                                    elementOpacity = (previewTime - appearAt) / fadeIn
                                }
                            }

                            const ElementComponent =
                                el.type === 'lottie' ? LottieElement :
                                    el.type === 'video' ? VideoElement :
                                        el.type === 'obj3d' ? Model3DElement :
                                            (el.type === 'confettiBurst' || el.type === 'confettiRain') ? ConfettiElement :
                                                el.type === 'image' ? ImageElement :
                                                    CTAElement;

                            return (
                                <group
                                    key={el.id}
                                    position={el.position}
                                    rotation={el.rotation}
                                    scale={el.scale}
                                    visible={elementVisible}
                                    onClick={(e) => { e.stopPropagation(); selectElement(el.id); }}
                                    onPointerMissed={(e) => e.type === 'click' && selectElement(null)}
                                    ref={(ref) => { el.ref = ref; }}
                                >
                                    <ElementComponent
                                        url={el.url}
                                        text={el.text}
                                        isSelected={isSelected}
                                        loop={el.loop}
                                        autoRotate={el.autoRotate}
                                        autoRotateSpeed={el.autoRotateSpeed}
                                        opacity={elementOpacity}
                                        previewTime={previewTime}
                                        appearAt={el.appearAt || 0}
                                        flagWave={el.flagWave}
                                        flagAmplitude={el.flagAmplitude}
                                        flagFrequency={el.flagFrequency}
                                        flagSpeed={el.flagSpeed}
                                        burstCount={el.burstCount}
                                        rainCount={el.rainCount}
                                        burstSpeed={el.burstSpeed}
                                        rainSpeed={el.rainSpeed}
                                        particleSize={el.particleSize}
                                        duration={el.confettiDuration}
                                        colors={el.confettiColors}
                                        emitterType={el.emitterType}
                                        particleCount={el.particleCount}
                                        particleSpeed={el.particleSpeed}
                                        confettiDuration={el.confettiDuration}
                                        confettiColors={el.confettiColors}
                                        pulseScale={el.pulseScale}
                                        pulseTarget={el.pulseTarget}
                                        pulseSpeed={el.pulseSpeed}
                                    />
                                </group>
                            )
                        })}
                    </Canvas>
                </main>

                {/* RIGHT PANEL: INSPECTOR */}
                <ErrorBoundary>
                    <Inspector />
                </ErrorBoundary>
            </div>

            {/* BOTTOM PANEL: TIMELINE */}
            <ErrorBoundary>
                <Timeline />
            </ErrorBoundary>

            {/* MODALS */}
            <AssetPickerDialog
                isOpen={pickerState.isOpen}
                type={pickerState.type}
                onClose={() => setPickerState({ isOpen: false, type: null })}
                onSelect={handleAssetSelected}
            />
        </div>
    )
}

export default App
