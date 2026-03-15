import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useSceneStore } from '../hooks/useSceneStore'
import { Clock, Play, Pause, RotateCcw } from 'lucide-react'

const Timeline = () => {
    const { scenes, activeSceneIndex, selectedId, selectElement, setPreviewTime } = useSceneStore()

    const activeScene = scenes[activeSceneIndex] || { elements: [] }
    const elements = activeScene.elements

    const TOTAL_SECONDS = 10

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const animFrameRef = useRef(null)
    const lastTimestampRef = useRef(null)
    const trackAreaRef = useRef(null)
    const isDraggingRef = useRef(false)

    // Animation loop
    useEffect(() => {
        if (!isPlaying) {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
            lastTimestampRef.current = null
            return
        }

        const animate = (timestamp) => {
            if (lastTimestampRef.current === null) {
                lastTimestampRef.current = timestamp
            }
            const deltaMs = timestamp - lastTimestampRef.current
            lastTimestampRef.current = timestamp

            setCurrentTime(prev => {
                const next = prev + deltaMs / 1000
                if (next >= TOTAL_SECONDS) {
                    setIsPlaying(false)
                    setPreviewTime(null)
                    return TOTAL_SECONDS
                }
                setPreviewTime(next)
                return next
            })

            animFrameRef.current = requestAnimationFrame(animate)
        }

        animFrameRef.current = requestAnimationFrame(animate)

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        }
    }, [isPlaying])

    const handlePlayPause = () => {
        if (currentTime >= TOTAL_SECONDS) {
            setCurrentTime(0)
            setPreviewTime(0)
        }
        setIsPlaying(prev => {
            if (!prev) {
                // Starting playback
                setPreviewTime(currentTime)
            } else {
                // Pausing — keep previewTime so scene stays frozen at current time
            }
            return !prev
        })
    }

    const handleReset = () => {
        setIsPlaying(false)
        setCurrentTime(0)
        setPreviewTime(null) // null = show everything normally
    }

    // Scrubber drag/click
    const LABEL_WIDTH = 150
    const getTimeFromMouseEvent = useCallback((e) => {
        if (!trackAreaRef.current) return 0
        const rect = trackAreaRef.current.getBoundingClientRect()
        // Offset by label column width
        const trackStart = rect.left + LABEL_WIDTH
        const trackWidth = rect.width - LABEL_WIDTH
        const x = Math.max(0, Math.min(e.clientX - trackStart, trackWidth))
        return (x / trackWidth) * TOTAL_SECONDS
    }, [])

    const handleScrubStart = useCallback((e) => {
        isDraggingRef.current = true
        setIsPlaying(false)
        const time = getTimeFromMouseEvent(e)
        setCurrentTime(time)
        setPreviewTime(time)

        const handleMove = (moveEvent) => {
            if (isDraggingRef.current) {
                const t = getTimeFromMouseEvent(moveEvent)
                setCurrentTime(t)
                setPreviewTime(t)
            }
        }
        const handleUp = () => {
            isDraggingRef.current = false
            window.removeEventListener('mousemove', handleMove)
            window.removeEventListener('mouseup', handleUp)
        }
        window.addEventListener('mousemove', handleMove)
        window.addEventListener('mouseup', handleUp)
    }, [getTimeFromMouseEvent])

    const playheadPercent = Math.min((currentTime / TOTAL_SECONDS) * 100, 100)
    const timeDisplay = currentTime.toFixed(1)

    if (elements.length === 0) {
        return (
            <footer className="timeline-panel">
                <div className="timeline-header">
                    <button className="play-btn">▶ Cargar Timeline</button>
                    <div className="time-ruler">0s &rarr; {TOTAL_SECONDS}s</div>
                </div>
                <div className="timeline-tracks">
                    <div className="track-placeholder">No hay elementos animados todavía...</div>
                </div>
            </footer>
        )
    }

    return (
        <footer className="timeline-panel">
            {/* Controls row */}
            <div className="timeline-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.5rem', borderBottom: '1px solid var(--border)' }}>
                <button
                    className="play-btn"
                    onClick={handlePlayPause}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: isPlaying ? '#ef4444' : '#4caf50', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}
                >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    {isPlaying ? 'Pausar' : 'Preview'}
                </button>
                <button
                    onClick={handleReset}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: '#444', color: '#aaa', border: 'none', padding: '4px 8px', borderRadius: '4px' }}
                    title="Reset"
                >
                    <RotateCcw size={14} />
                </button>
                <span style={{ fontSize: '0.8rem', color: '#03a9f4', fontFamily: 'monospace', minWidth: '60px' }}>
                    {timeDisplay}s / {TOTAL_SECONDS}s
                </span>

                {/* Time ruler */}
                <div style={{ flex: 1, position: 'relative', height: '20px', marginLeft: '0.5rem' }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => (
                        <div key={t} style={{
                            position: 'absolute',
                            left: `${(t / TOTAL_SECONDS) * 100}%`,
                            fontSize: '0.6rem',
                            color: '#666',
                            transform: t === 10 ? 'translateX(-100%)' : 'none',
                            top: '2px'
                        }}>
                            {t}s
                        </div>
                    ))}
                </div>
            </div>

            {/* Tracks area */}
            <div
                ref={trackAreaRef}
                className="timeline-tracks"
                style={{ overflowY: 'auto', position: 'relative', cursor: 'col-resize' }}
                onMouseDown={handleScrubStart}
            >
                {/* Playhead line */}
                <div style={{
                    position: 'absolute',
                    left: `calc(150px + (100% - 150px) * ${playheadPercent / 100})`,
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    background: '#ef4444',
                    zIndex: 10,
                    pointerEvents: 'none',
                    boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)'
                }}>
                    {/* Playhead triangle */}
                    <div style={{
                        position: 'absolute',
                        top: '-2px',
                        left: '-5px',
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '8px solid #ef4444'
                    }} />
                </div>

                {elements.map((el) => {
                    const isSelected = selectedId === el.id

                    const leftPercent = Math.min(Math.max((el.appearAt / TOTAL_SECONDS) * 100, 0), 100)
                    const fadeWidthPercent = Math.min(Math.max((el.fadeInDuration / TOTAL_SECONDS) * 100, 0), 100 - leftPercent)
                    const activeWidthPercent = 100 - leftPercent

                    return (
                        <div
                            key={el.id}
                            onClick={(e) => { e.stopPropagation(); selectElement(el.id) }}
                            style={{
                                display: 'flex',
                                height: '28px',
                                background: isSelected ? '#3a3a3a' : '#2d2d2d',
                                cursor: 'pointer',
                                borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                            }}
                        >
                            {/* Track Label */}
                            <div style={{
                                width: '150px', minWidth: '150px', padding: '0 0.5rem',
                                display: 'flex', alignItems: 'center',
                                borderRight: '1px solid var(--border)',
                                fontSize: '0.75rem', color: isSelected ? '#fff' : '#aaa',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {el.name}
                            </div>

                            {/* Track Timeline Area */}
                            <div style={{ flex: 1, position: 'relative', background: '#1e1e1e' }}>
                                {/* Active bar */}
                                <div style={{
                                    position: 'absolute',
                                    left: `${leftPercent}%`,
                                    width: `${activeWidthPercent}%`,
                                    height: '100%',
                                    background: 'rgba(0, 122, 204, 0.2)',
                                    border: '1px solid rgba(0, 122, 204, 0.4)',
                                    borderLeft: 'none', borderRight: 'none',
                                    pointerEvents: 'none'
                                }} />

                                {/* Fade in block */}
                                <div style={{
                                    position: 'absolute',
                                    left: `${leftPercent}%`,
                                    width: `${fadeWidthPercent}%`,
                                    height: '100%',
                                    background: 'rgba(76, 175, 80, 0.5)',
                                    borderLeft: '2px solid #4caf50',
                                    pointerEvents: 'none'
                                }} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </footer>
    )
}

export default Timeline
