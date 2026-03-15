import React from 'react'
import { Html } from '@react-three/drei'

export const CTAElement = ({ text, isSelected, opacity = 1 }) => {
    return (
        <Html transform distanceFactor={5} zIndexRange={[100, 0]}>
            <div style={{
                background: '#e02725',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '25px',
                fontWeight: 'bold',
                fontFamily: 'sans-serif',
                fontSize: '18px',
                pointerEvents: 'none',
                boxShadow: isSelected ? '0 0 0 4px #4caf50' : '0 4px 10px rgba(0,0,0,0.5)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                opacity: opacity,
                transition: 'opacity 0.1s ease'
            }}>
                {text || 'CONOCE MÁS'}
            </div>
        </Html>
    )
}
