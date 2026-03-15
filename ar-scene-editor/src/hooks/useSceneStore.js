import { create } from 'zustand'

const DEFAULTS = {
    lottie: { name: 'Nueva Animación', scale: [1, 1, 1], loop: true },
    obj3d: { name: 'Nuevo Modelo 3D', scale: [0.5, 0.5, 0.5], autoRotate: false, autoRotateSpeed: 1 },
    video: { name: 'Nuevo Video', scale: [1, 1, 1] },
    cta: { name: 'Nuevo Botón CTA', scale: [1, 1, 1] },
    confettiBurst: {
        name: 'Confeti Explosión 💥', scale: [1, 1, 1],
        emitterType: 'burst',
        particleCount: 80, particleSpeed: 1.5,
        particleSize: 0.04, confettiDuration: 6,
        confettiColors: ['#E30613', '#FFD700', '#FFFFFF', '#00A651', '#0080FF', '#FF6B00']
    },
    confettiRain: {
        name: 'Confeti Lluvia 🌧️', scale: [1, 1, 1],
        emitterType: 'rain',
        particleCount: 50, particleSpeed: 0.6,
        particleSize: 0.04, confettiDuration: 10,
        confettiColors: ['#E30613', '#FFD700', '#FFFFFF', '#00A651', '#0080FF', '#FF6B00']
    },
    image: {
        name: 'Nueva Imagen PNG',
        scale: [1, 1, 1],
        pulseScale: false,
        pulseTarget: 1.2,
        pulseSpeed: 0.5
    }
}

const createEmptyScene = (index) => ({
    id: `scene_${Date.now()}_${index}`,
    name: `Escena ${index + 1}`,
    targetImageIndex: index, // Correlaciona con target.mind
    elements: []
})

export const useSceneStore = create((set, get) => ({
    scenes: [createEmptyScene(0)],
    activeSceneIndex: 0,
    selectedId: null,
    previewTime: null, // null = show all elements normally, number = timeline preview mode

    setPreviewTime: (time) => set({ previewTime: time }),

    // --- SCENE MANAGEMENT ---
    addScene: () => set((state) => ({
        scenes: [...state.scenes, createEmptyScene(state.scenes.length)],
        activeSceneIndex: state.scenes.length,
        selectedId: null
    })),

    removeScene: (index) => set((state) => {
        if (state.scenes.length <= 1) return state // Keep at least one scene
        const newScenes = state.scenes.filter((_, i) => i !== index)
        const newActiveIndex = state.activeSceneIndex >= index
            ? Math.max(0, state.activeSceneIndex - 1)
            : state.activeSceneIndex
        return { scenes: newScenes, activeSceneIndex: newActiveIndex, selectedId: null }
    }),

    switchScene: (index) => set({ activeSceneIndex: index, selectedId: null }),

    updateActiveScene: (updates) => set((state) => {
        const newScenes = state.scenes.map((scene, i) =>
            i === state.activeSceneIndex ? { ...scene, ...updates } : scene
        )
        return { scenes: newScenes }
    }),

    // --- ELEMENT MANAGEMENT (Current Scene) ---
    addElement: (type, url = null) => set((state) => {
        const id = `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        const newElement = {
            id,
            type,
            url,
            name: url ? url.split('/').pop() : DEFAULTS[type].name,
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: DEFAULTS[type].scale,
            appearAt: 0,
            fadeInDuration: 0.5,
            visible: true,
            ...(DEFAULTS[type] || {}) // Spread type-specific defaults (confetti params, etc.)
        }
        const newScenes = state.scenes.map((scene, i) => {
            if (i === state.activeSceneIndex) {
                return { ...scene, elements: [...scene.elements, newElement] }
            }
            return scene
        })
        return { scenes: newScenes, selectedId: id }
    }),

    removeElement: (id) => set((state) => {
        const newScenes = state.scenes.map((scene, i) => {
            if (i === state.activeSceneIndex) {
                return { ...scene, elements: scene.elements.filter((el) => el.id !== id) }
            }
            return scene
        })
        return {
            scenes: newScenes,
            selectedId: state.selectedId === id ? null : state.selectedId
        }
    }),

    selectElement: (id) => set({ selectedId: id }),

    toggleVisibility: (id) => set((state) => {
        const newScenes = state.scenes.map((scene, i) => {
            if (i === state.activeSceneIndex) {
                return {
                    ...scene,
                    elements: scene.elements.map((el) =>
                        el.id === id ? { ...el, visible: !el.visible } : el
                    )
                }
            }
            return scene
        })
        return { scenes: newScenes }
    }),

    updateElement: (id, updates) => set((state) => {
        const newScenes = state.scenes.map((scene, i) => {
            if (i === state.activeSceneIndex) {
                return {
                    ...scene,
                    elements: scene.elements.map((el) =>
                        el.id === id ? { ...el, ...updates } : el
                    )
                }
            }
            return scene
        })
        return { scenes: newScenes }
    }),

    // --- EXPORT / IMPORT ---
    exportJSON: () => {
        const { scenes } = get()
        // Clean up references before exporting
        const cleanScenes = scenes.map(scene => ({
            ...scene,
            elements: scene.elements.map(({ ref, ...el }) => el)
        }))

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ scenes: cleanScenes }, null, 2))
        const downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", dataStr)
        downloadAnchorNode.setAttribute("download", "scenes.json")
        document.body.appendChild(downloadAnchorNode)
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
    },

    importJSON: (jsonData) => set((state) => {
        try {
            const parsed = JSON.parse(jsonData)
            if (parsed.scenes && Array.isArray(parsed.scenes)) {
                return { scenes: parsed.scenes, activeSceneIndex: 0, selectedId: null }
            }
        } catch (e) {
            console.error("Failed to parse JSON file.")
        }
        return state
    })
}))
