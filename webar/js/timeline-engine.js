import * as THREE from 'three';
import { APP_CONFIG } from './config.js';

/**
 * TimelineEngine - Maneja la aparición (appearAt) y el desvanecimiento (fadeIn)
 * de los elementos de una escena en función del tiempo transcurrido desde que se detectó el Target.
 */
export class TimelineEngine {
    constructor() {
        this.tracks = []; // Array de { mesh, data, materialRef, player, hasStarted }
        this.elapsedTime = 0;
        this.isRunning = false;
        this.clock = new THREE.Clock(false);
        this.visibilityForced = false; // Flag para el check de visibilidad
    }

    /**
     * Registra un elemento en la línea de tiempo.
     * @param {THREE.Object3D} mesh - El objeto 3D a controlar.
     * @param {Object} data - Datos JSON del elemento (appearAt, fadeInDuration, etc)
     * @param {Object} player - Opcional. Instancia de AnimationPlayer o VideoPlayer
     */
    addTrack(mesh, data, player = null) {
        // Encontrar los materiales para hacer el Fade In
        const materials = [];
        mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                // Asegurar que el material soporta transparencia si hay fadeIn
                if (data.fadeInDuration > 0) {
                    child.material.transparent = true;
                    // Guardamos la opacidad original si existe, sino 1
                    child.userData.targetOpacity = child.material.opacity !== undefined ? child.material.opacity : 1;
                    child.material.opacity = 0;
                }
                materials.push(child.material);
            }
        });

        // Inicialmente oculto a menos que appearAt sea 0
        mesh.visible = false;

        this.tracks.push({
            mesh,
            data,
            materials,
            player,
            hasStarted: false,
            // Pre-cálculos
            appearAt: data.appearAt || 0,
            fadeInDuration: data.fadeInDuration || 0
        });
    }

    start() {
        this.elapsedTime = 0;
        this.isRunning = true;
        this.visibilityForced = false;
        this.clock.start();

        // Resetear tracks
        this.tracks.forEach(track => {
            track.hasStarted = false;
            track.mesh.visible = false;
            track.materials.forEach(mat => {
                if (track.fadeInDuration > 0) mat.opacity = 0;
            });
            // Si es un reproductor y estaba corriendo, lo paramos primero
            if (track.player && typeof track.player.pause === 'function') {
                track.player.pause();
            }
        });

        // Primera actualización forzada para elementos en T=0
        this.update();
    }

    stop() {
        this.isRunning = false;
        this.clock.stop();
        this.tracks.forEach(track => {
            track.mesh.visible = false;
            if (track.player && typeof track.player.pause === 'function') {
                track.player.pause();
            }
        });
    }

    update() {
        if (!this.isRunning) return;

        const delta = this.clock.getDelta();
        this.elapsedTime += delta;

        // Forzar visibilidad 100% después de visibilityCheckTime
        const checkTime = APP_CONFIG.mindar.visibilityCheckTime || 5;
        if (!this.visibilityForced && this.elapsedTime >= checkTime) {
            this.visibilityForced = true;
            console.log(`Timeline: Forzando visibilidad 100% a los ${checkTime}s`);
            this.tracks.forEach(track => {
                track.mesh.visible = true;
                track.materials.forEach(mat => {
                    const targetOp = mat.userData?.targetOpacity || 1;
                    mat.opacity = targetOp;
                    mat.needsUpdate = true;
                });
                // Arrancar players que no hayan empezado
                if (!track.hasStarted) {
                    track.hasStarted = true;
                    if (track.player && typeof track.player.play === 'function') {
                        track.player.play();
                    }
                }
            });
        }

        this.tracks.forEach(track => {
            // 1. Check if it's time to appear
            if (!track.hasStarted && this.elapsedTime >= track.appearAt) {
                track.hasStarted = true;
                track.mesh.visible = true;

                // Si no hay fadeIn, la opacidad debe ir directo al target
                if (track.fadeInDuration === 0) {
                    track.materials.forEach(mat => {
                        const targetOp = mat.userData?.targetOpacity || 1;
                        mat.opacity = targetOp;
                        mat.needsUpdate = true;
                    });
                }

                if (track.player && typeof track.player.play === 'function') {
                    track.player.play();
                }
            }

            // 2. Animate Fade In
            if (track.hasStarted && track.fadeInDuration > 0) {
                const timeSinceAppear = this.elapsedTime - track.appearAt;

                if (timeSinceAppear <= track.fadeInDuration) {
                    // Animando el fade — interpolar opacidad
                    const progress = timeSinceAppear / track.fadeInDuration;
                    track.materials.forEach(mat => {
                        const targetOp = mat.userData?.targetOpacity || 1;
                        mat.opacity = Math.min(progress * targetOp, targetOp);
                        mat.needsUpdate = true;
                    });
                } else {
                    // Fade terminó — clampear a opacidad target (FIX: evita quedarse en 0.97)
                    track.materials.forEach(mat => {
                        const targetOp = mat.userData?.targetOpacity || 1;
                        if (mat.opacity < targetOp) {
                            mat.opacity = targetOp;
                            mat.needsUpdate = true;
                        }
                    });
                }
            }

            // 3. Update associated players (Lottie/Video logic)
            if (track.hasStarted && track.player && typeof track.player.update === 'function') {
                track.player.update();
            }
        });
    }
}
