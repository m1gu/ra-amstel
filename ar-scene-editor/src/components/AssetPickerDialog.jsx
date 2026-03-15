import React, { useEffect, useState } from 'react'
import { Folder, Film, FileJson, CopyCheck, X } from 'lucide-react'

const AssetPickerDialog = ({ type, isOpen, onClose, onSelect }) => {
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(true)

    const typeToFolder = {
        'lottie': 'animations',
        'video': 'videos',
        'obj3d': 'models',
        'image': 'images',
        'cta': null // CTAs don't have a specific asset file
    }

    useEffect(() => {
        if (!isOpen) return

        const folder = typeToFolder[type]
        if (!folder) {
            setLoading(false)
            return
        }

        setLoading(true)
        fetch('/api/assets')
            .then(res => res.json())
            .then(data => {
                setAssets(data[folder] || [])
                setLoading(false)
            })
            .catch(err => {
                console.error("Error fetching assets:", err)
                setLoading(false)
            })
    }, [isOpen, type])

    if (!isOpen) return null

    // For CTA, we don't need a file, just confirm addition
    if (type === 'cta') {
        return (
            <div style={overlayStyle}>
                <div style={dialogStyle}>
                    <h3>Añadir Botón CTA</h3>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '1rem 0' }}>El botón Call To Action se configura en el Panel Inspector.</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="icon-btn-small" onClick={onClose} style={{ padding: '0.5rem 1rem', background: '#444' }}>Cancelar</button>
                        <button className="btn-primary" onClick={() => onSelect(null)}>Añadir</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={overlayStyle}>
            <div style={dialogStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Folder size={18} color="#03a9f4" />
                        Seleccionar Asset ({type.toUpperCase()})
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}><X size={18} /></button>
                </div>

                <div style={listContainerStyle}>
                    {loading && <div style={{ padding: '1rem', color: '#888' }}>Cargando directorio /webar/assets/...</div>}
                    {!loading && assets.length === 0 && <div style={{ padding: '1rem', color: '#ffb74d' }}>No hay archivos encontrados en la carpeta correspondiente. Sube archivos a la carpeta webar/assets/ para verlos aquí.</div>}
                    {!loading && assets.map((filename, idx) => {
                        return (
                            <div
                                key={idx}
                                style={fileItemStyle}
                                onClick={() => onSelect(`${typeToFolder[type]}/${filename}`)}
                            >
                                {type === 'lottie' ? <FileJson size={16} color="#ffeb3b" /> :
                                    type === 'video' ? <Film size={16} color="#f44336" /> :
                                        type === 'image' ? <CopyCheck size={16} color="#8bc34a" /> :
                                            <CopyCheck size={16} color="#03a9f4" />}
                                <span>{filename}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}

const dialogStyle = {
    background: '#1e1e1e',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '1.5rem',
    width: '450px',
    maxWidth: '90%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    color: '#fff'
}

const listContainerStyle = {
    background: '#121212',
    border: '1px solid #2d2d2d',
    borderRadius: '4px',
    height: '250px',
    overflowY: 'auto'
}

const fileItemStyle = {
    padding: '0.8rem 1rem',
    borderBottom: '1px solid #2d2d2d',
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background 0.2s'
}

export default AssetPickerDialog
