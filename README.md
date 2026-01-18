# Amstel AR Demo - Fase 1

Este proyecto es una demostración de Realidad Aumentada web para Amstel.

## Estructura del Proyecto
- `index.html`: Punto de entrada principal.
- `js/`: Lógica de la aplicación (AR, Animación, Video).
- `css/`: Estilos de la interfaz de usuario.
- `assets/`: Recursos (imágenes target, animaciones Lottie, videos).

## Instrucciones para Desarrollo Local

Para que la cámara funcione, es **REQUISITO OBLIGATORIO** utilizar HTTPS o `localhost`.

### 1. Servidor Local
Puedes usar cualquier servidor estático. Por ejemplo, usando Node.js:
```bash
npx serve .
```

### 2. Pruebas en Móvil (HTTPS)
Para probar en un dispositivo móvil real, debes exponer tu servidor local mediante un túnel seguro:

**Opción A: Ngrok**
1. Instala ngrok y corre:
```bash
ngrok http 3000
```
2. Abre la URL `https` proporcionada en tu móvil.

**Opción B: Local-SSL-Proxy**
O usa cualquier otra herramienta que te proporcione un certificado SSL válido.

## Estado Actual: Fase 1 Completada
- ✅ Estructura de carpetas creada.
- ✅ `index.html` base con MindAR + Three.js + Lottie.
- ✅ UI básica (Loading, Scan Hint).
- ✅ Controlador de AR inicializado (JS modular).
- ✅ Configuración de dependencias.

**Siguiente paso:** Fase 2 - Detección de Imagen Target (Generación del archivo .mind).
