/**
 * optimize-gltf.mjs - Script de optimización de modelos GLTF para WebAR
 * 
 * USO:
 *   node optimize-gltf.mjs <ruta-entrada.gltf> [ruta-salida.glb]
 * 
 * EJEMPLO:
 *   node optimize-gltf.mjs "D:\AMSTEL\Material del cliente\COPA-3D\GLTF\copa.gltf" "./webar/assets/models/copa.glb"
 * 
 * RESULTADO:
 *   - Texturas redimensionadas a 1024x1024 máximo
 *   - Texturas convertidas a WebP (compresión ~80%)
 *   - Geometría simplificada (weld + simplify)
 *   - Archivo de salida en formato .glb (binario, un solo fichero)
 *   - Peso objetivo: < 10 MB
 */

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
    dedup,
    flatten,
    weld,
    simplify,
    textureCompress,
    prune,
    quantize,
} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import { MeshoptSimplifier } from 'meshoptimizer';
import path from 'path';
import fs from 'fs';

// --- Configuración ---
const MAX_TEXTURE_SIZE = 1024;   // Resolución máxima por lado (px)
const SIMPLIFY_RATIO = 0.5;     // Conservar el 50% de los triángulos
const SIMPLIFY_ERROR = 0.01;    // Tolerancia de error visual

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('❌ Uso: node optimize-gltf.mjs <entrada.gltf> [salida.glb]');
        process.exit(1);
    }

    const inputPath = args[0];
    const outputPath = args[1] || inputPath.replace(/\.(gltf|glb)$/i, '_optimized.glb');

    console.log('');
    console.log('🏆 GLTF Optimizer para WebAR');
    console.log('============================');
    console.log(`📂 Entrada:  ${inputPath}`);
    console.log(`📁 Salida:   ${outputPath}`);
    console.log('');

    // Inicializar el IO reader con soporte para todas las extensiones
    const io = new NodeIO()
        .registerExtensions(ALL_EXTENSIONS)
        .registerDependencies({
            'draco3d.decoder': await draco3d.createDecoderModule(),
            'draco3d.encoder': await draco3d.createEncoderModule(),
        });

    // 1. Leer el archivo
    console.log('📖 Leyendo archivo GLTF...');
    const document = await io.read(inputPath);

    const root = document.getRoot();
    const meshCount = root.listMeshes().length;
    const textureCount = root.listTextures().length;
    const materialCount = root.listMaterials().length;

    console.log(`   Mallas: ${meshCount} | Texturas: ${textureCount} | Materiales: ${materialCount}`);

    // 2. Preparar MeshoptSimplifier
    await MeshoptSimplifier.ready;

    // 3. Pipeline de optimización
    console.log('');
    console.log('⚙️  Ejecutando pipeline de optimización...');

    // Paso 3a: Eliminar datos duplicados
    console.log('   [1/7] Eliminando duplicados...');
    await document.transform(dedup());

    // Paso 3b: Eliminar nodos vacíos o sin uso
    console.log('   [2/7] Podando nodos sin usar...');
    await document.transform(prune());

    // Paso 3c: Aplanar escena
    console.log('   [3/7] Aplanando jerarquía de escena...');
    await document.transform(flatten());

    // Paso 3d: Unir vértices cercanos (weld)
    console.log('   [4/7] Soldando vértices cercanos...');
    await document.transform(weld());

    // Paso 3e: Simplificar geometría
    console.log(`   [5/7] Simplificando geometría (ratio: ${SIMPLIFY_RATIO * 100}%)...`);
    await document.transform(
        simplify({ simplifier: MeshoptSimplifier, ratio: SIMPLIFY_RATIO, error: SIMPLIFY_ERROR })
    );

    // Paso 3f: Comprimir y redimensionar texturas a JPEG
    console.log(`   [6/6] Comprimiendo texturas a JPEG y redimensionando a máx ${MAX_TEXTURE_SIZE}px...`);
    await document.transform(
        textureCompress({
            encoder: sharp,
            targetFormat: 'jpeg',
            resize: [MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE],
            quality: 80,
        })
    );

    // Paso 3h: Cuantizar atributos de vértice (reduce peso de geo data sin perder calidad visual)
    console.log('   [+] Cuantizando atributos de vértices...');
    await document.transform(quantize());

    // 4. Escribir el resultado como .glb (binario)
    console.log('');
    console.log('💾 Escribiendo archivo GLB optimizado...');
    try {
        const glb = await io.writeBinary(document);
        fs.writeFileSync(outputPath, Buffer.from(glb));
        console.log('   Escritura exitosa via writeBinary.');
    } catch (writeErr) {
        console.error('   ⚠️ Error en writeBinary:', writeErr.message);
        console.log('   Intentando con io.write() directo...');
        await io.write(outputPath, document);
    }

    // 5. Reporte final
    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    const inputMB = (inputStats.size / (1024 * 1024)).toFixed(2);
    const outputMB = (outputStats.size / (1024 * 1024)).toFixed(2);
    const reduction = (((inputStats.size - outputStats.size) / inputStats.size) * 100).toFixed(1);

    console.log('');
    console.log('✅ ¡Optimización completada!');
    console.log('============================');
    console.log(`   📊 Peso original:   ${inputMB} MB`);
    console.log(`   📊 Peso optimizado: ${outputMB} MB`);
    console.log(`   📊 Reducción:       ${reduction}%`);
    console.log('');
    console.log(`   Archivo listo en: ${path.resolve(outputPath)}`);
    console.log('');
}

main().catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
});
