// frontend/src/pages/StoreLocator.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search } from 'lucide-react';

// Assets
import lineasSuperior from '../assets/images/lineas-doradas-superior.png';
import fondoRojo from '../assets/images/fondo-rojo.png';

const StoreLocator = ({ onBack }) => {
    const [cities, setCities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const resp = await api.get('/locations/cities');
            setCities(resp.data);
        } catch (err) { console.error(err); }
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (val.length > 1) {
            const filtered = cities.filter(c => c.toLowerCase().includes(val.toLowerCase()));
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleCitySelect = async (city) => {
        setSearchTerm(city);
        setSelectedCity(city);
        setSuggestions([]);
        setLoading(true);
        try {
            const resp = await api.get(`/locations?city=${city}`);
            setLocations(resp.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    return (
        <div className="brand-bg" style={{
            minHeight: '100vh',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            overflow: 'visible'
        }}>
            {/* Red Background Fill - Pushed to 530px from top to match VideoGallery */}
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

            {/* Tactical Golden Lines (Global Classes) */}
            <img src={lineasSuperior} alt="" className="lineas-superior" style={{ zIndex: 10 }} />
            <img src={lineasSuperior} alt="" className="lineas-inferior" style={{ zIndex: 10, transform: 'translateX(-50%) rotate(180deg)' }} />

            <div className="landing-container" style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '20vh' }}>
                <div style={{ padding: '5rem 1.5rem 2rem 1.5rem', textAlign: 'center' }}>

                    <h2 style={{
                        fontFamily: 'Bebas Neue',
                        fontSize: '2.4rem',
                        color: 'black',
                        marginBottom: '1.5rem',
                        lineHeight: '1.1',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Selecciona la ciudad<br />y consigue el vaso<br />conmemorativo
                    </h2>

                    {/* Search Input with Autocomplete */}
                    <div style={{ position: 'relative', maxWidth: '320px', margin: '0 auto' }}>
                        <div style={{
                            position: 'relative',
                            borderRadius: '25px',
                            border: '2px solid var(--amstel-gold)',
                            background: 'white',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            zIndex: 20
                        }}>
                            <Search size={20} style={{ marginLeft: '1rem', color: '#666' }} />
                            <input
                                type="text"
                                placeholder="Busca tu ciudad..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                style={{
                                    padding: '0.45rem 1rem',
                                    border: 'none',
                                    width: '100%',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    color: '#000',
                                    outline: 'none'
                                }}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => { setSearchTerm(''); setSuggestions([]); setLocations([]); setSelectedCity(''); }}
                                    style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}
                                >
                                    <span style={{ fontSize: '1.2rem', color: '#999' }}>×</span>
                                </button>
                            )}
                        </div>

                        {suggestions.length > 0 && (
                            <div className="suggestions-list" style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'white',
                                borderRadius: '0 0 15px 15px',
                                marginTop: '2px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                                zIndex: 100,
                                maxHeight: '200px',
                                overflowY: 'auto',
                                border: '1px solid #ddd'
                            }}>
                                {suggestions.map(s => (
                                    <div
                                        key={s}
                                        onClick={() => handleCitySelect(s)}
                                        style={{
                                            padding: '0.8rem 1.5rem',
                                            textAlign: 'left',
                                            color: '#333',
                                            fontWeight: '600',
                                            borderTop: '1px solid #eee',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ flex: 1, padding: '0 1.5rem 2.5rem 1.5rem' }}>
                    {selectedCity && !loading && (
                        <p style={{
                            textAlign: 'center',
                            color: 'black',
                            fontFamily: 'Bebas Neue',
                            fontSize: '1.6rem',
                            marginBottom: '1.5rem',
                            textTransform: 'uppercase'
                        }}>
                            {locations.length} LOCALES DISPONIBLES
                        </p>
                    )}

                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'black', marginTop: '2rem', fontFamily: 'Bebas Neue' }}>Buscando locales...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {locations.length > 0 ? (
                                locations.map((loc) => (
                                    <div key={loc.id} style={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        borderRadius: '12px',
                                        padding: '1.2rem',
                                        position: 'relative',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.3rem'
                                    }}>
                                        <h3 style={{
                                            fontSize: '1.2rem',
                                            color: '#333',
                                            fontFamily: 'Bebas Neue',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {loc.store_name}
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>
                                            {loc.address}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                selectedCity && <p style={{ textAlign: 'center', color: 'black', opacity: 0.6, marginTop: '2rem' }}>No se encontraron locales en esta ciudad.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div style={{
                    marginTop: 'auto',
                    padding: '0 1.5rem 2rem 1.5rem',
                    display: 'flex',
                    zIndex: 300,
                    justifyContent: 'center'
                }}>
                    <button
                        className="btn-volver-gallery"
                        onClick={onBack}
                        style={{
                            padding: '8px 19.2px',
                            width: 'auto',
                            fontSize: '16px',
                            display: 'inline-block',
                            background: 'white',
                            color: 'var(--amstel-red)',
                            border: '2px solid var(--amstel-gold)',
                            borderRadius: '50px',
                            fontFamily: 'Bebas Neue',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                        }}
                    >
                        VOLVER AL MENÚ
                    </button>
                </div>
            </div>

            <style>{`
                .white-bottom-bar {
                    background-color: white;
                    color: #666;
                    font-size: 0.65rem;
                    text-align: center;
                    padding: 0.8rem 1.5rem;
                    width: 100%;
                    position: relative;
                    z-index: 100;
                    font-family: sans-serif;
                    text-transform: none;
                }
                .btn-volver-gallery {
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default StoreLocator;
