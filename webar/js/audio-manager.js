/**
 * AudioManager - Gestiona el sonido ambiente de la experiencia
 */
import { APP_CONFIG } from './config.js';

export class AudioManager {
    constructor() {
        this.config = APP_CONFIG.audio;
        this.audio = null;
        this.isMuted = false;
        this.ctxUnlocked = false;

        if (this.config.enabled) {
            this.init();
        }
    }

    init() {
        this.audio = new Audio(this.config.url);
        this.audio.loop = false; // El usuario quiere que suene al inicio
        this.audio.volume = this.config.volume || 0.5;

        // Intentar desbloquear audio en la primera interacción
        const unlock = () => {
            if (this.ctxUnlocked) return;
            this.audio.play().then(() => {
                this.audio.pause();
                this.audio.currentTime = 0;
                this.ctxUnlocked = true;
                console.log("AudioManager: AudioContext desbloqueado");
                window.removeEventListener('click', unlock);
                window.removeEventListener('touchstart', unlock);
            }).catch(e => console.warn("AudioManager: Esperando interacción para audio", e));
        };

        window.addEventListener('click', unlock);
        window.addEventListener('touchstart', unlock);
    }

    /**
     * Reproduce el sonido de la escena (barra de fútbol)
     */
    playSceneSound() {
        if (!this.config.enabled || !this.audio || this.isMuted) return;

        // Reiniciar y reproducir
        this.audio.currentTime = 0;
        this.audio.play().catch(e => {
            console.warn("AudioManager: No se pudo reproducir (posible falta de interacción)", e);
        });
    }

    /**
     * Detiene el sonido (opcional, si se sale de la escena)
     */
    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }

    /**
     * Conmuta el estado de mute
     * @returns {boolean} Nuevo estado de mute
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.audio) {
            this.audio.muted = this.isMuted;
            if (this.isMuted) this.audio.pause();
        }
        return this.isMuted;
    }
}
