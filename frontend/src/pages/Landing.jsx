// frontend/src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';
import VideoGallery from './VideoGallery';
import StoreLocator from './StoreLocator';
import GlobalFooter from '../components/GlobalFooter';

// Assets (simulated via imports for Vite)
import headerImg from '../assets/images/header.png';
import lineasSuperior from '../assets/images/lineas-doradas-superior.png';
import lineasCentral from '../assets/images/lineas-doradas-central.png';
import titulo1 from '../assets/images/titulo1.png';

import titulo2 from '../assets/images/titulo2.png';

const Landing = () => {
    // Estados principales
    const [ageVerified, setAgeVerified] = useState(sessionStorage.getItem('amstel_age_gate') === 'true');
    const [showRejection, setShowRejection] = useState(false);
    const [view, setView] = useState('menu'); // 'menu', 'gallery', 'locator'
    const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });

    // Lógica del Age Gate
    const handleAgeVerification = (e) => {
        e.preventDefault();
        const { day, month, year } = birthDate;
        if (!day || !month || !year) return;

        const birth = new Date(year, month - 1, day);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
            age--;
        }

        if (age >= 18) {
            sessionStorage.setItem('amstel_age_gate', 'true');
            setAgeVerified(true);
        } else {
            setShowRejection(true);
        }
    };

    // --- RENDERIZADO DE VISTAS ---

    if (!ageVerified) {
        return (
            <div className="brand-bg">
                {/* 1. Fondo (brand-bg) - 2. Líneas doradas (zIndex: 10) */}
                <img src={lineasSuperior} alt="" className="lineas-superior" style={{ zIndex: 10 }} />
                <img src={lineasCentral} alt="" className="lineas-central" style={{ zIndex: 10 }} />
                <img src={lineasSuperior} alt="" className="lineas-inferior" style={{ zIndex: 10 }} />

                <div className="red-bottom-overlay" style={{ zIndex: 1 }}></div>

                <div className="landing-container" style={{ padding: '4rem 1.5rem 22vh 1.5rem', justifyContent: 'space-between', textAlign: 'center' }}>

                    {/* 4. Título Superior (zIndex: 30) - Reducido al 50% */}
                    <div style={{ zIndex: 30, marginTop: '2rem' }}>
                        <img src={titulo1} alt="Todas las emociones entran en juego" style={{ width: '50%', maxWidth: '200px' }} />
                    </div>

                    {/* 3. Imagen Hero (zIndex: 20) - ESCALADA A 1100px */}
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                        <img
                            src={headerImg}
                            alt="Amstel Challenge"
                            className="hero-image-hands"
                            style={{
                                position: 'absolute',
                                maxWidth: 'none',
                                objectFit: 'contain',
                                zIndex: 20,
                                pointerEvents: 'none',
                                transform: 'translateY(50px)'
                            }}
                        />
                    </div>

                    {/* 5. Resto de elementos (zIndex: 40) */}
                    <div style={{ zIndex: 40, paddingBottom: '2rem' }}>
                        <p style={{ textTransform: 'uppercase', fontWeight: '800', fontSize: '1.1rem', marginBottom: '1.5rem', color: 'white' }}>
                            Ingresa tu fecha de nacimiento
                        </p>

                        <form onSubmit={handleAgeVerification} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                            <div className="age-gate-input-wrapper">
                                <input
                                    className="age-gate-input"
                                    type="text"
                                    placeholder="DD / MM / YYYY"
                                    value={`${birthDate.day}${birthDate.day ? ' / ' : ''}${birthDate.month}${birthDate.month ? ' / ' : ''}${birthDate.year}`}
                                    onChange={e => {
                                        const clean = e.target.value.replace(/[^0-9]/g, '');
                                        if (clean.length <= 8) {
                                            setBirthDate({
                                                day: clean.substring(0, 2),
                                                month: clean.substring(2, 4),
                                                year: clean.substring(4, 8)
                                            });
                                        }
                                    }}
                                />
                            </div>
                            <button type="submit" className="btn-amstel-gold" style={{ width: 'auto', minWidth: '150px' }}>
                                ENTRAR
                            </button>
                        </form>
                    </div>

                    {showRejection && (
                        <div style={overlayStyle}>
                            <div className="card" style={{ maxWidth: '300px', textAlign: 'center', color: '#333' }}>
                                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>¡Lo sentimos!</h3>
                                <p>Debes tener +18 para poder ingresar a la página.</p>
                                <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setShowRejection(false)}>CERRAR</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const renderMenu = () => (
        <div className="brand-bg">
            {/* 1. Fondo (brand-bg) - 2. Líneas doradas (zIndex: 10) */}
            <img src={lineasSuperior} alt="" className="lineas-superior" style={{ zIndex: 10 }} />
            <img src={lineasCentral} alt="" className="lineas-central" style={{ zIndex: 10 }} />
            <img src={lineasSuperior} alt="" className="lineas-inferior" style={{ zIndex: 10 }} />

            <div className="red-bottom-overlay" style={{ zIndex: 1 }}></div>

            <div className="landing-container" style={{ padding: '4rem 1.5rem 22vh 1.5rem', justifyContent: 'space-between', textAlign: 'center' }}>

                {/* 4. Título Superior (zIndex: 30) - Imagen titulo2 */}
                <div style={{ zIndex: 30, marginTop: '1rem' }}>
                    <img src={titulo2} alt="Interactúa y revive las emociones" style={{ width: '80%', maxWidth: '350px' }} />
                </div>

                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                    <img
                        src={headerImg}
                        alt="Amstel Challenge"
                        className="hero-image-hands"
                        style={{
                            position: 'absolute',
                            maxWidth: 'none',
                            objectFit: 'contain',
                            zIndex: 20,
                            pointerEvents: 'none',
                            transform: 'translateY(50px)'
                        }}
                    />
                </div>

                {/* Botones del Menú (zIndex: 40) */}
                <div style={{ zIndex: 40, display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
                    <button className="btn-amstel-menu" onClick={() => window.location.href = import.meta.env.BASE_URL + 'webar/'}>
                        Activa la Realidad Aumentada
                    </button>
                    <button className="btn-amstel-menu" onClick={() => setView('gallery')}>
                        Revive los últimos 6 campeonatos
                    </button>
                    <button className="btn-amstel-menu" onClick={() => setView('locator')}>
                        ¿Dónde consigo el vaso?
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="landing-page" style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
            {view === 'menu' && renderMenu()}
            {view === 'gallery' && <VideoGallery onBack={() => setView('menu')} />}
            {view === 'locator' && <StoreLocator onBack={() => setView('menu')} />}

            {/* Inyectando el Footer Global al final de toda la vista */}
            <GlobalFooter />
        </div>
    );
};

const ageInputStyle = {
    width: '60px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid var(--amstel-gold)',
    color: 'white',
    textAlign: 'center',
    padding: '0.8rem 0.5rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '700',
    margin: 0
};

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem'
};

export default Landing;
