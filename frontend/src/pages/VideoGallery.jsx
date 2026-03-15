import React, { useState, useEffect } from 'react';
import { Play, Trophy, Users } from 'lucide-react';
import api from '../services/api';

// Assets
import logoConmebol from '../assets/images/logo-conmebol.png';
import lineasSuperior from '../assets/images/lineas-doradas-superior.png';
import titulo3 from '../assets/images/titulo3.png';
import thumbnailPartido from '../assets/images/thumbnail-partido.png';
import fondoRojo from '../assets/images/fondo-rojo.png';
import fondoGotas from '../assets/images/fondo-gotas.png';
import logoAmstel from '../assets/images/logo-amstel.png';

// Scoreboard Assets
import escudoFlamengo from '../assets/images/escudo-flamengo.png';
import escudoPalmeiras from '../assets/images/escudo-palmeiras.png';
import iconoEstadioBig from '../assets/images/icono-estadio-big.png';
import iconoEstadioSmall from '../assets/images/icono-estadio-small.png';

const VideoGallery = ({ onBack }) => {
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [phases, setPhases] = useState([]);
    const [expandedPhase, setExpandedPhase] = useState(null);
    const [videos, setVideos] = useState([]);
    const [finalData, setFinalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Bloquear scroll del body cuando el reproductor está abierto
    useEffect(() => {
        if (selectedVideo) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [selectedVideo]);

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        try {
            const resp = await api.get('/tournaments/years');
            const data = resp.data;
            setYears(data);
            if (data.length > 0) {
                // Seleccionar 2025 por defecto si existe, sino el primero
                const defaultYear = data.find(y => y.year === 2025) || data[0];
                handleYearSelect(defaultYear);
            }
        } catch (err) { console.error(err); }
    };

    const handleYearSelect = async (year) => {
        setSelectedYear(year);
        setLoading(true);
        setExpandedPhase(null);
        setSelectedVideo(null); // Reset player when changing year
        try {
            const phasesResp = await api.get(`/tournaments/${year.id}/phases`);
            setPhases(phasesResp.data);

            const finalResp = await api.get(`/tournaments/${year.id}/final`);
            setFinalData(finalResp.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const togglePhase = async (phase) => {
        if (expandedPhase?.id === phase.id) {
            setExpandedPhase(null);
            return;
        }
        setExpandedPhase(phase);
        if (!phase.is_unlocked) return;
        try {
            const resp = await api.get(`/tournaments/phases/${phase.slug}/videos`);
            setVideos(resp.data);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="brand-bg" style={{ minHeight: '100vh', paddingBottom: '2.5rem', position: 'relative' }}>

            {/* Background Red Fill - Pushed to bottom of content */}
            <div style={{
                position: 'absolute',
                top: '530px',
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${fondoRojo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                zIndex: 1
            }} />

            {/* Tactical Golden Lines */}
            <img src={lineasSuperior} alt="" className="lineas-superior" style={{ zIndex: 10 }} />

            <div className="landing-container" style={{ paddingBottom: '20vh', minHeight: 'auto' }}>
                <div style={{ padding: '0 1.5rem', textAlign: 'center', marginBottom: '1.5rem', zIndex: 30 }}>
                    <div style={{ marginBottom: '1.5rem', paddingTop: '80px' }}>
                        <img
                            src={titulo3}
                            alt="Selecciona el año y revive las emociones del campeonato"
                            style={{ width: '60%', maxWidth: '270px' }}
                        />
                    </div>

                    {/* Year Selector Chips */}
                    <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', padding: '0.5rem 0', justifyContent: 'center' }}>
                        {years.map(y => (
                            <button
                                key={y.id}
                                onClick={() => handleYearSelect(y)}
                                className={`year-btn ${selectedYear?.id === y.id ? 'active' : ''}`}
                            >
                                {y.year}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>Cargando datos...</div>
                ) : (
                    <div style={{ padding: '0 1rem' }}>

                        {/* Final Video Preview (Always visible if data exists) */}
                        {finalData && (
                            <div
                                className="final-video-preview"
                                style={{ marginBottom: '2rem' }}
                                onClick={() => setSelectedVideo({
                                    id: 'final',
                                    title: `FINAL ${selectedYear?.year}`,
                                    video_url: import.meta.env.BASE_URL + 'assets/videos/test-video.mp4', // URL local usando BASE_URL
                                    thumbnail_url: thumbnailPartido,
                                    sub_phase: 'GRAN FINAL'
                                })}
                            >
                                <div className="thumb-container" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                                    <img src={thumbnailPartido} alt="Final Highlights" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                    <div className="play-overlay" style={{ opacity: 1, background: 'rgba(0,0,0,0.2)' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '50%', display: 'flex' }}>
                                            <Play size={32} fill="white" color="white" />
                                        </div>
                                    </div>

                                    {/* Video Controls Mock Overlay */}
                                    <div className="video-mock-controls">
                                        <div className="controls-left">
                                            <Play size={14} fill="white" />
                                            <div style={{ marginLeft: '10px' }}><Users size={14} /></div>
                                        </div>
                                        <div className="controls-right">
                                            <div style={{ transform: 'rotate(45deg)' }}><Play size={14} /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Phases Accordion - Centered and smaller */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '300px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                            {phases.map(phase => (
                                <div key={phase.id}>
                                    <button
                                        className={`phase-accordion-gallery ${expandedPhase?.id === phase.id ? 'expanded' : ''}`}
                                        onClick={() => togglePhase(phase)}
                                        style={{ opacity: phase.is_unlocked ? 1 : 0.5 }}
                                    >
                                        <span>{phase.name}</span>
                                    </button>

                                    {expandedPhase?.id === phase.id && phase.is_unlocked && (
                                        <div className="video-grid" style={{ padding: '1rem 0' }}>
                                            {videos.length > 0 ? videos.map(v => (
                                                <div key={v.id} className="video-item" onClick={() => setSelectedVideo(v)}>
                                                    <div className="thumb-container">
                                                        <img src={v.thumbnail_url || '/assets/images/thumbnail-generic.jpg'} alt={v.title} />
                                                        <div className="play-overlay">
                                                            <Play size={24} fill="white" />
                                                        </div>
                                                    </div>
                                                    <div style={{ padding: '0.5rem' }}>
                                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{v.title}</p>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--amstel-gold)' }}>{v.video_type}</span>
                                                    </div>
                                                </div>
                                            )) : <p style={{ color: 'white', textAlign: 'center', padding: '1rem', opacity: 0.6 }}>No hay videos cargados aún.</p>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Standard Footer Actions (Only if no video selected) */}
                        {!selectedVideo && (
                            <div style={{ marginTop: '2rem', padding: '0', display: 'flex', justifyContent: 'center', zIndex: 100 }}>
                                <button className="btn-volver-gallery" onClick={onBack}>
                                    VOLVER AL MENÚ
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Video Player View (Overlay experience) */}
            {selectedVideo && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 200,
                    backgroundImage: `url(${fondoRojo})`,
                    backgroundSize: 'cover',
                    overflowY: 'auto',
                    paddingBottom: '20vh'
                }}>
                    {/* Top droplets texture */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '530px',
                        backgroundImage: `url(${fondoGotas})`,
                        backgroundSize: 'cover',
                        zIndex: -1
                    }} />

                    {/* Tactical Golden Lines for Overlay */}
                    <img src={lineasSuperior} alt="" className="lineas-superior" style={{ zIndex: 10 }} />

                    <div className="landing-container" style={{ paddingTop: '3rem', minHeight: 'auto' }}>

                        {/* 3. Título */}
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem', zIndex: 30, position: 'relative', paddingTop: '40px' }}>
                            <img
                                src={titulo3}
                                alt="Selecciona el año y revive las emociones del campeonato"
                                style={{ width: '60%', maxWidth: '270px' }}
                            />
                        </div>

                        {/* 4. Menú de Años */}
                        <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', padding: '0.5rem 0', justifyContent: 'center', marginBottom: '1.5rem', zIndex: 30, position: 'relative' }}>
                            {years.map(y => (
                                <button
                                    key={y.id}
                                    onClick={() => handleYearSelect(y)}
                                    className={`year-btn ${selectedYear?.id === y.id ? 'active' : ''}`}
                                >
                                    {y.year}
                                </button>
                            ))}
                        </div>

                        {/* Hero Video */}
                        <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: 30 }}>
                            <div className="thumb-container" style={{ borderRadius: '15px', overflow: 'hidden', border: '2px solid var(--amstel-gold)' }}>
                                {selectedVideo.video_url.includes('.mp4') ? (
                                    <video
                                        width="100%"
                                        height="200"
                                        src={selectedVideo.video_url}
                                        controls
                                        autoPlay
                                        style={{ outline: 'none', background: '#000' }}
                                    />
                                ) : (
                                    <iframe
                                        width="100%"
                                        height="200"
                                        src={`https://www.youtube.com/embed/${selectedVideo.video_url.includes('v=') ? selectedVideo.video_url.split('v=')[1] : 'dQw4w9WgXcQ'}`}
                                        title={selectedVideo.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                )}
                            </div>
                        </div>

                        {/* Scoreboard (Only for Final) */}
                        {selectedVideo?.id === 'final' && finalData && (
                            <div style={{
                                padding: '0 1.5rem',
                                textAlign: 'center',
                                color: 'white',
                                zIndex: 30,
                                position: 'relative',
                                marginBottom: '2rem',
                                marginTop: '-0.5rem'
                            }}>
                                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', marginBottom: '1.5rem', letterSpacing: '1px' }}>
                                    FINAL {selectedYear?.year}
                                </h3>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.5rem',
                                    marginBottom: '1rem'
                                }}>
                                    {/* Team Left */}
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <img src={escudoPalmeiras} alt="" style={{ height: '60px', marginBottom: '0.5rem' }} />
                                        <p style={{ fontFamily: 'Bebas Neue', fontSize: '1rem', textTransform: 'uppercase' }}>{finalData.team_home_name}</p>
                                    </div>

                                    {/* Score Left */}
                                    <div style={{ fontSize: '2.5rem', fontFamily: 'Bebas Neue', fontWeight: 'bold' }}>
                                        {finalData.score_home}
                                    </div>

                                    {/* Stadium Central Icon */}
                                    <div style={{ flex: '0 0 80px' }}>
                                        <img src={iconoEstadioBig} alt="Stadium" style={{ width: '100%' }} />
                                    </div>

                                    {/* Score Right */}
                                    <div style={{ fontSize: '2.5rem', fontFamily: 'Bebas Neue', fontWeight: 'bold' }}>
                                        {finalData.score_away}
                                    </div>

                                    {/* Team Right */}
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <img src={escudoFlamengo} alt="" style={{ height: '60px', marginBottom: '0.5rem' }} />
                                        <p style={{ fontFamily: 'Bebas Neue', fontSize: '1rem', textTransform: 'uppercase' }}>{finalData.team_away_name}</p>
                                    </div>
                                </div>

                                {/* Stadium Footer */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                                    <img src={iconoEstadioSmall} alt="" style={{ height: '14px' }} />
                                    <span style={{ fontFamily: 'Bebas Neue', fontSize: '0.9rem', color: 'white', letterSpacing: '0.5px' }}>
                                        {finalData.stadium_name}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Related Videos Grid (Only if NOT Final) */}
                        {selectedVideo?.id !== 'final' && (
                            <div style={{ padding: '0 1.5rem', position: 'relative', zIndex: 30 }}>
                                <div className="video-grid">
                                    {videos.filter(vid => vid.id !== selectedVideo.id).map(v => (
                                        <div key={v.id} className="video-item" onClick={() => {
                                            setSelectedVideo(v);
                                            window.scrollTo(0, 0);
                                        }}>
                                            <div className="thumb-container">
                                                <img src={v.thumb_url || v.thumbnail_url || '/assets/images/thumbnail-generic.jpg'} alt={v.title} />
                                                <div className="play-overlay">
                                                    <Play size={20} fill="white" />
                                                </div>
                                            </div>
                                            <div style={{ padding: '0.4rem' }}>
                                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', textTransform: 'uppercase' }}>{v.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons for Player */}
                        <div style={{
                            marginTop: '2rem',
                            padding: '0 1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            zIndex: 300
                        }}>
                            <button className="btn-volver-gallery" onClick={onBack}>
                                VOLVER AL MENÚ
                            </button>
                            <button className="btn-volver-gallery" onClick={() => setSelectedVideo(null)} style={{ background: 'white', color: 'var(--amstel-red)' }}>
                                ATRÁS
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .year-btn {
                    background: white;
                    border: 2px solid var(--amstel-gold);
                    color: black;
                    padding: 0.4rem 1rem;
                    border-radius: 50px;
                    font-weight: 400;
                    font-size: 0.95rem;
                    font-family: 'Bebas Neue', sans-serif;
                    min-width: 60px;
                    transition: all 0.2s;
                }
                .year-btn.active, .year-btn:hover {
                    background: var(--amstel-red);
                    color: white;
                    border-color: var(--amstel-gold);
                }
                .phase-accordion-gallery {
                    width: 100%;
                    background: transparent;
                    border: none;
                    border-bottom: 0.5px solid rgba(255,255,255,0.4);
                    color: white;
                    padding: 0px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text-transform: uppercase;
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 1.1rem;
                    transition: all 0.3s;
                    min-height: 40px;
                }
                .phase-accordion-gallery:last-child {
                    border-bottom: none;
                }
                .phase-accordion-gallery.expanded {
                    font-weight: bold;
                    letter-spacing: 0.05em;
                }
                .btn-volver-gallery {
                    background: white;
                    color: var(--amstel-red);
                    border: 2px solid var(--amstel-gold);
                    padding: 0.5rem 1.2rem;
                    border-radius: 50px;
                    font-family: 'Bebas Neue', sans-serif;
                    font-weight: 400;
                    font-size: 1rem;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    cursor: pointer;
                }
                .final-video-preview {
                    position: relative;
                    max-width: 450px;
                    margin: 0 auto;
                    cursor: pointer;
                }
                .video-mock-controls {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 0.8rem 1.2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
                    color: white;
                }
                .controls-left { display: flex; align-items: center; }
                .video-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .video-item {
                    background: rgba(255,255,255,0.03);
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .video-item:hover { transform: scale(1.02); }
                .thumb-container {
                    position: relative;
                    aspect-ratio: 16/9;
                    background: #111;
                }
                .thumb-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .play-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.8;
                }
                .btn-amstel-menu, .btn-volver-gallery, .year-btn {
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default VideoGallery;
