/**
 * SceneLoader - Fetches and parses the scenes.json exported by the Editor
 */
export class SceneLoader {
    constructor() { }

    async load(url) {
        console.log("SceneLoader: Buscando archivo de escenas en", url);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${url}`);
            const data = await res.json();
            console.log("SceneLoader: Archivo cargado con éxito. Escenas:", data.scenes.length);
            return data;
        } catch (err) {
            console.error("SceneLoader: Error fatal al cargar scenes.json.", err);
            // Devolver un default vacío en caso de fallo para no romper la app entera
            return { formatVersion: '1.0', scenes: [] };
        }
    }

    /**
     * Devuelve la escena asociada a un índice de marcador específico.
     */
    getSceneForMarker(sceneData, markerIndex) {
        if (!sceneData || !sceneData.scenes) return null;
        // Support both the new 'targetImageIndex' (number) and legacy 'markerId' (string)
        return sceneData.scenes.find(s =>
            s.targetImageIndex === markerIndex ||
            s.targetImageIndex === markerIndex.toString() ||
            s.markerId === markerIndex.toString()
        );
    }
}
