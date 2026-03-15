import React from 'react'
import { useSceneStore } from '../hooks/useSceneStore'
import { Settings, Clock, Type, AlignLeft } from 'lucide-react'

const NumberInput = ({ label, value, onChange, step = 0.1, axisColor = '#aaa' }) => (
    <div style={{ display: 'flex', alignItems: 'center', background: '#2d2d2d', borderRadius: '4px', padding: '0 4px', flex: 1 }}>
        <span style={{ color: axisColor, fontSize: '0.7rem', fontWeight: 'bold', paddingRight: '4px' }}>{label}</span>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            step={step}
            style={{ width: '100%', background: 'none', border: 'none', color: '#fff', fontSize: '0.8rem', outline: 'none', padding: '4px 0' }}
        />
    </div>
)

const Vector3Input = ({ label, vector, onChange, step = 0.1 }) => (
    <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>{label}</span>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
            <NumberInput label="X" value={vector[0]} onChange={(v) => onChange([v, vector[1], vector[2]])} axisColor="#ff3b3b" step={step} />
            <NumberInput label="Y" value={vector[1]} onChange={(v) => onChange([vector[0], v, vector[2]])} axisColor="#4caf50" step={step} />
            <NumberInput label="Z" value={vector[2]} onChange={(v) => onChange([vector[0], vector[1], v])} axisColor="#2196f3" step={step} />
        </div>
    </div>
)

const Inspector = () => {
    const { scenes, activeSceneIndex, selectedId, updateElement, updateActiveScene } = useSceneStore()

    const activeScene = scenes[activeSceneIndex] || { elements: [] }
    const elements = activeScene.elements

    if (!selectedId) {
        return (
            <aside className="panel inspector-panel" style={{ overflowY: 'auto' }}>
                <h3>Configuración de Escena</h3>
                <div style={{ padding: '1rem' }}>
                    <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Nombre de Escena</span>
                        <input
                            type="text"
                            value={activeScene.name || ''}
                            onChange={(e) => updateActiveScene({ name: e.target.value })}
                            style={{ width: '100%', background: '#2d2d2d', border: '1px solid var(--border)', color: '#fff', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', marginBottom: '0.5rem' }}
                        />

                        <span style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem', marginTop: '1rem' }}>Índice de Target Image (targets.mind)</span>
                        <input
                            type="number"
                            value={activeScene.targetImageIndex !== undefined ? activeScene.targetImageIndex : 0}
                            onChange={(e) => updateActiveScene({ targetImageIndex: parseInt(e.target.value, 10) || 0 })}
                            style={{ width: '100%', background: '#2d2d2d', border: '1px solid var(--border)', color: '#fff', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}
                        />
                        <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.5rem' }}>
                            Este índice dicta qué marcador activa esta escena en la cámara AR.
                        </p>
                    </div>
                </div>
            </aside>
        )
    }

    const el = elements.find(e => e.id === selectedId)
    if (!el) return null

    const handleUpdate = (updates) => updateElement(selectedId, updates)

    return (
        <aside className="panel inspector-panel" style={{ overflowY: 'auto' }}>
            <h3>Inspector</h3>

            <div style={{ padding: '1rem' }}>
                {/* HEADER INFO */}
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <input
                        type="text"
                        value={el.name}
                        onChange={(e) => handleUpdate({ name: e.target.value })}
                        style={{ width: '100%', background: '#2d2d2d', border: '1px solid var(--border)', color: '#fff', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', marginBottom: '0.5rem' }}
                    />
                    <span className="badge" style={{ background: '#444', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase' }}>
                        TYPE: {el.type}
                    </span>
                </div>

                {/* TRANSFORM */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', marginBottom: '0.8rem' }}>
                        <Settings size={16} color="var(--accent)" />
                        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Transform</h4>
                    </div>
                    <Vector3Input label="Position" vector={el.position} onChange={(v) => handleUpdate({ position: v })} />
                    <Vector3Input label="Rotation" vector={el.rotation} onChange={(v) => handleUpdate({ rotation: v })} step={15} />
                    <Vector3Input label="Scale" vector={el.scale} onChange={(v) => handleUpdate({ scale: v })} />
                </div>

                {/* TIMING */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', marginBottom: '0.8rem' }}>
                        <Clock size={16} color="var(--accent)" />
                        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Timing</h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>Appear At (s)</span>
                            <input type="number" step="0.1" value={el.appearAt} onChange={(e) => handleUpdate({ appearAt: parseFloat(e.target.value) || 0 })} style={{ width: '80px', background: '#2d2d2d', border: 'none', color: '#fff', padding: '4px 6px', borderRadius: '4px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>Fade In (s)</span>
                            <input type="number" step="0.1" value={el.fadeInDuration} onChange={(e) => handleUpdate({ fadeInDuration: parseFloat(e.target.value) || 0 })} style={{ width: '80px', background: '#2d2d2d', border: 'none', color: '#fff', padding: '4px 6px', borderRadius: '4px' }} />
                        </div>
                    </div>
                </div>

                {/* EXTRA CTAs PROPERTIES */}
                {el.type === 'cta' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', marginBottom: '0.8rem' }}>
                            <Type size={16} color="var(--accent)" />
                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>CTA Settings</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>Text</span>
                            <input type="text" value={el.text || 'CONOCE MÁS'} onChange={(e) => handleUpdate({ text: e.target.value })} style={{ background: '#2d2d2d', border: '1px solid var(--border)', color: '#fff', padding: '4px 6px', borderRadius: '4px' }} />

                            <span style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>Link URL</span>
                            <input type="text" value={el.link || 'https://'} onChange={(e) => handleUpdate({ link: e.target.value })} style={{ background: '#2d2d2d', border: '1px solid var(--border)', color: '#fff', padding: '4px 6px', borderRadius: '4px' }} />
                        </div>
                    </div>
                )}

                {/* LOTTIE SETTINGS */}
                {el.type === 'lottie' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', marginBottom: '0.8rem' }}>
                            <Settings size={16} color="#ffeb3b" />
                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Animación Lottie</h4>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>Loop</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={el.loop !== false}
                                    onChange={(e) => handleUpdate({ loop: e.target.checked })}
                                    style={{ accentColor: 'var(--accent)' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: el.loop !== false ? '#4caf50' : '#888' }}>
                                    {el.loop !== false ? 'Activado' : 'Desactivado'}
                                </span>
                            </label>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>🏳️ Efecto Bandera</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={el.flagWave || false}
                                    onChange={(e) => handleUpdate({ flagWave: e.target.checked })}
                                    style={{ accentColor: '#ff9800' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: el.flagWave ? '#ff9800' : '#888' }}>
                                    {el.flagWave ? 'Activado' : 'Desactivado'}
                                </span>
                            </label>
                        </div>
                        {el.flagWave && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>Amplitud</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="range" min="0.02" max="0.5" step="0.01"
                                            value={el.flagAmplitude || 0.15}
                                            onChange={(e) => handleUpdate({ flagAmplitude: parseFloat(e.target.value) })}
                                            style={{ width: '70px', accentColor: '#ff9800' }}
                                        />
                                        <span style={{ fontSize: '0.7rem', color: '#aaa', minWidth: '30px' }}>{el.flagAmplitude || 0.15}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>Frecuencia</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="range" min="1" max="8" step="0.5"
                                            value={el.flagFrequency || 3}
                                            onChange={(e) => handleUpdate({ flagFrequency: parseFloat(e.target.value) })}
                                            style={{ width: '70px', accentColor: '#ff9800' }}
                                        />
                                        <span style={{ fontSize: '0.7rem', color: '#aaa', minWidth: '24px' }}>{el.flagFrequency || 3}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>Velocidad</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="range" min="0.5" max="6" step="0.5"
                                            value={el.flagSpeed || 2}
                                            onChange={(e) => handleUpdate({ flagSpeed: parseFloat(e.target.value) })}
                                            style={{ width: '70px', accentColor: '#ff9800' }}
                                        />
                                        <span style={{ fontSize: '0.7rem', color: '#aaa', minWidth: '24px' }}>{el.flagSpeed || 2}x</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* IMAGE PNG SETTINGS */}
                {el.type === 'image' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', marginBottom: '0.8rem' }}>
                            <Settings size={16} color="#8bc34a" />
                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Imagen PNG</h4>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>Latido (Pulse Loop)</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={el.pulseScale || false}
                                    onChange={(e) => handleUpdate({ pulseScale: e.target.checked })}
                                    style={{ accentColor: '#8bc34a' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: el.pulseScale ? '#8bc34a' : '#888' }}>
                                    {el.pulseScale ? 'Activado' : 'Desactivado'}
                                </span>
                            </label>
                        </div>
                        {el.pulseScale && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>Escala Objetivo</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="range" min="1.0" max="2.0" step="0.05"
                                            value={el.pulseTarget || 1.2}
                                            onChange={(e) => handleUpdate({ pulseTarget: parseFloat(e.target.value) })}
                                            style={{ width: '70px', accentColor: '#8bc34a' }}
                                        />
                                        <span style={{ fontSize: '0.7rem', color: '#aaa', minWidth: '30px' }}>{el.pulseTarget || 1.2}x</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>Velocidad</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="range" min="0.1" max="5.0" step="0.1"
                                            value={el.pulseSpeed || 0.5}
                                            onChange={(e) => handleUpdate({ pulseSpeed: parseFloat(e.target.value) })}
                                            style={{ width: '70px', accentColor: '#8bc34a' }}
                                        />
                                        <span style={{ fontSize: '0.7rem', color: '#aaa', minWidth: '24px' }}>{el.pulseSpeed || 0.5}s</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* 3D MODEL SETTINGS */}
                {el.type === 'obj3d' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', marginBottom: '0.8rem' }}>
                            <Settings size={16} color="#03a9f4" />
                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Modelo 3D</h4>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>Auto-Rotación Y</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={el.autoRotate || false}
                                    onChange={(e) => handleUpdate({ autoRotate: e.target.checked })}
                                    style={{ accentColor: 'var(--accent)' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: el.autoRotate ? '#4caf50' : '#888' }}>
                                    {el.autoRotate ? 'Activado' : 'Desactivado'}
                                </span>
                            </label>
                        </div>
                        {el.autoRotate && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>Velocidad</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="5"
                                        step="0.1"
                                        value={el.autoRotateSpeed || 1}
                                        onChange={(e) => handleUpdate({ autoRotateSpeed: parseFloat(e.target.value) })}
                                        style={{ width: '80px', accentColor: 'var(--accent)' }}
                                    />
                                    <span style={{ fontSize: '0.75rem', color: '#aaa', minWidth: '28px' }}>{el.autoRotateSpeed || 1}x</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* CONFETTI SETTINGS (Burst or Rain) */}
                {(el.type === 'confettiBurst' || el.type === 'confettiRain') && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', marginBottom: '0.8rem' }}>
                            <Settings size={16} color={el.type === 'confettiBurst' ? '#ff5722' : '#2196f3'} />
                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>
                                {el.type === 'confettiBurst' ? 'Explosión 💥' : 'Lluvia 🌧️'}
                            </h4>
                        </div>

                        {/* Particle Count */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>Cantidad</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <input type="range" min="10" max="200" step="10"
                                    value={el.particleCount || 80}
                                    onChange={(e) => handleUpdate({ particleCount: parseInt(e.target.value) })}
                                    style={{ width: '65px', accentColor: el.type === 'confettiBurst' ? '#ff5722' : '#2196f3' }}
                                />
                                <span style={{ fontSize: '0.7rem', color: '#aaa', minWidth: '28px' }}>{el.particleCount || 80}</span>
                            </div>
                        </div>

                        {/* Speed */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>Velocidad</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <input type="range" min="0.1" max="5" step="0.1"
                                    value={el.particleSpeed || (el.type === 'confettiBurst' ? 1.5 : 0.6)}
                                    onChange={(e) => handleUpdate({ particleSpeed: parseFloat(e.target.value) })}
                                    style={{ width: '65px', accentColor: el.type === 'confettiBurst' ? '#ff5722' : '#2196f3' }}
                                />
                                <span style={{ fontSize: '0.7rem', color: '#aaa', minWidth: '28px' }}>{el.particleSpeed || (el.type === 'confettiBurst' ? 1.5 : 0.6)}</span>
                            </div>
                        </div>

                        {/* Particle Size */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>Tamaño</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <input type="range" min="0.02" max="0.3" step="0.01"
                                    value={el.particleSize || 0.04}
                                    onChange={(e) => handleUpdate({ particleSize: parseFloat(e.target.value) })}
                                    style={{ width: '65px', accentColor: el.type === 'confettiBurst' ? '#ff5722' : '#2196f3' }}
                                />
                                <span style={{ fontSize: '0.7rem', color: '#aaa', minWidth: '35px' }}>{el.particleSize || 0.04}</span>
                            </div>
                        </div>

                        {/* Duration */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>Duración (s)</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <input type="range" min="2" max="20" step="1"
                                    value={el.confettiDuration || 6}
                                    onChange={(e) => handleUpdate({ confettiDuration: parseInt(e.target.value) })}
                                    style={{ width: '65px', accentColor: el.type === 'confettiBurst' ? '#ff5722' : '#2196f3' }}
                                />
                                <span style={{ fontSize: '0.7rem', color: '#aaa', minWidth: '24px' }}>{el.confettiDuration || 6}s</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    )
}

export default Inspector
