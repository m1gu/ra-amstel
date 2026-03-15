/**
 * ConfettiEffect - Single-emitter confetti particle system.
 * Each instance is EITHER burst (explosion from center) OR rain (falling from above).
 * Uses individual Mesh planes that rotate and spin for natural paper-like movement.
 */
export class ConfettiEffect {
    constructor(THREE) {
        this.THREE = THREE;
        this.group = new THREE.Group();
        this.group.visible = false;
        this.meshes = [];
        this.velocities = [];
        this.elapsed = 0;
        this.isActive = false;
        this.config = {};
    }

    init(parentGroup) {
        const THREE = this.THREE;
        const cfg = this.config;
        const emitterType = cfg.emitterType || 'burst';
        const isBurst = emitterType === 'burst';
        const count = Math.min(cfg.particleCount || 60, 100);
        const speed = cfg.particleSpeed || 1.5;
        const size = cfg.particleSize || 0.06;

        const colors = cfg.colors || [
            '#E30613', '#FFD700', '#FFFFFF', '#00A651', '#0080FF', '#FF6B00'
        ];

        this.meshes = [];
        this.velocities = [];
        this.initialPositions = [];
        this.isBurst = isBurst;
        this.particleSpeed = speed;
        this.totalCount = count;

        for (let i = 0; i < count; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];

            const geo = new THREE.PlaneGeometry(size, size);
            const mat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 1,
                side: THREE.DoubleSide,
                depthWrite: false
            });

            const varScale = 0.7 + Math.random() * 0.6;
            const mesh = new THREE.Mesh(geo, mat);
            mesh.scale.set(varScale, varScale, varScale);
            mesh.renderOrder = 1000;
            mesh.frustumCulled = false;

            let px, py, pz;
            let vel;

            if (isBurst) {
                px = 0;
                py = 0;
                pz = 0.02;

                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI - Math.PI / 2;
                const sp = (0.3 + Math.random() * 0.7) * speed;
                vel = {
                    x: Math.cos(theta) * Math.cos(phi) * sp * 0.5,
                    y: Math.sin(phi) * sp * 0.4 + 0.6,
                    z: Math.sin(theta) * Math.cos(phi) * sp * 0.12,
                    gravity: 1.0 + Math.random() * 0.5,
                    spin: (Math.random() - 0.5) * 5,
                    delay: 0
                };
            } else {
                px = (Math.random() - 0.5) * 1.8;
                py = 1.5 + Math.random() * 1.0;
                pz = (Math.random() - 0.5) * 0.15;

                vel = {
                    x: (Math.random() - 0.5) * 0.1,
                    y: -(0.1 + Math.random() * speed * 0.5),
                    z: (Math.random() - 0.5) * 0.03,
                    gravity: 0.08 + Math.random() * 0.06,
                    spin: (Math.random() - 0.5) * 4,
                    delay: Math.random() * 3
                };
            }

            mesh.position.set(px, py, pz);
            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            this.group.add(mesh);
            this.meshes.push(mesh);
            this.velocities.push(vel);
            this.initialPositions.push({ x: px, y: py, z: pz });
        }

        parentGroup.add(this.group);

        console.log(`[CONFETTI] init [${emitterType}]: ${count} meshes, size=${size}, speed=${speed}`);
    }

    start() {
        if (this.meshes.length === 0) return;
        console.log(`[CONFETTI] START [${this.isBurst ? 'burst' : 'rain'}] — ${this.meshes.length} meshes`);

        this.elapsed = 0;
        this.isActive = true;
        this.group.visible = true;

        const speed = this.particleSpeed || 1.5;

        for (let i = 0; i < this.totalCount; i++) {
            const ip = this.initialPositions[i];
            this.meshes[i].position.set(ip.x, ip.y, ip.z);
            this.meshes[i].material.opacity = 1;
            this.meshes[i].visible = true;
            // Rotación aleatoria al reiniciar
            this.meshes[i].rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
        }

        // Re-generate velocities
        this.velocities = this.initialPositions.map(() => {
            if (this.isBurst) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI - Math.PI / 2;
                const sp = (0.3 + Math.random() * 0.7) * speed;
                return {
                    x: Math.cos(theta) * Math.cos(phi) * sp * 0.5,
                    y: Math.sin(phi) * sp * 0.4 + 0.6,
                    z: Math.sin(theta) * Math.cos(phi) * sp * 0.12,
                    gravity: 1.0 + Math.random() * 0.5,
                    spin: (Math.random() - 0.5) * 5,
                    delay: 0
                };
            } else {
                return {
                    x: (Math.random() - 0.5) * 0.1,
                    y: -(0.1 + Math.random() * speed * 0.5),
                    z: (Math.random() - 0.5) * 0.03,
                    gravity: 0.08 + Math.random() * 0.06,
                    spin: (Math.random() - 0.5) * 4,
                    delay: Math.random() * 3
                };
            }
        });
    }

    stop() {
        this.isActive = false;
        this.group.visible = false;
    }

    update(delta) {
        if (!this.isActive || this.meshes.length === 0) return;

        this.elapsed += delta;
        const duration = this.config.duration || 10;

        if (this.elapsed > duration) {
            this.stop();
            return;
        }

        for (let i = 0; i < this.totalCount; i++) {
            const mesh = this.meshes[i];
            const vel = this.velocities[i];

            if (!this.isBurst && this.elapsed < vel.delay) continue;

            mesh.position.x += vel.x * delta;
            mesh.position.y += vel.y * delta;
            mesh.position.z += vel.z * delta;

            vel.y -= vel.gravity * delta;
            vel.x *= (1 - 0.4 * delta);
            vel.z *= (1 - 0.4 * delta);

            // Rotar la partícula (efecto papelito girando)
            mesh.rotation.x += vel.spin * delta * 0.5;
            mesh.rotation.z += vel.spin * delta * 0.3;
        }

        // Fade out últimos 2 segundos
        const fadeStart = duration - 2;
        if (this.elapsed > fadeStart) {
            const alpha = Math.max(0, 1 - (this.elapsed - fadeStart) / 2);
            for (let i = 0; i < this.totalCount; i++) {
                this.meshes[i].material.opacity = alpha;
            }
        }
    }
}
