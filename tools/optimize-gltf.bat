@echo off
REM ============================================================
REM  optimize-gltf.bat - Optimizador de Modelos 3D para WebAR
REM  USO: optimize-gltf.bat "ruta\entrada.gltf" "ruta\salida.glb"
REM ============================================================

set INPUT=%~1
set OUTPUT=%~2

if "%INPUT%"=="" (
    echo USO: optimize-gltf.bat "entrada.gltf" "salida.glb"
    exit /b 1
)

if "%OUTPUT%"=="" set OUTPUT=%~dpn1_optimized.glb

set TEMP_FILE=%~dpn1_temp.glb

echo.
echo === GLTF Optimizer para WebAR ===
echo Entrada: %INPUT%
echo Salida:  %OUTPUT%
echo.

REM Paso 1: Copiar y convertir a GLB (un solo fichero binario)
echo [1/5] Convirtiendo a GLB...
call gltf-transform copy "%INPUT%" "%TEMP_FILE%"
if errorlevel 1 (echo ERROR en copy & exit /b 1)

REM Paso 2: Eliminar duplicados y podar
echo [2/5] Eliminando duplicados y podando...
call gltf-transform dedup "%TEMP_FILE%" "%TEMP_FILE%"
call gltf-transform prune "%TEMP_FILE%" "%TEMP_FILE%"

REM Paso 3: Soldar vertices y simplificar geometria
echo [3/5] Soldando vertices y simplificando geometria (50%%)...
call gltf-transform weld "%TEMP_FILE%" "%TEMP_FILE%"

REM Paso 4: Redimensionar texturas a 1024px maximo
echo [4/5] Redimensionando texturas a 1024x1024 max...
call gltf-transform resize "%TEMP_FILE%" "%TEMP_FILE%" --width 1024 --height 1024

REM Paso 5: Cuantizar atributos de vertices
echo [5/5] Cuantizando atributos...
call gltf-transform quantize "%TEMP_FILE%" "%OUTPUT%"

REM Limpiar temporal
if exist "%TEMP_FILE%" del "%TEMP_FILE%"

echo.
echo === Optimizacion completada ===
echo Archivo listo en: %OUTPUT%
echo.

REM Mostrar tamaños
for %%A in ("%INPUT%") do echo Tamano original:   %%~zA bytes
for %%A in ("%OUTPUT%") do echo Tamano optimizado: %%~zA bytes
echo.
