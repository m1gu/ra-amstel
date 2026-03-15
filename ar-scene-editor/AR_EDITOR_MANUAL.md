# Manual de Usuario: AR Scene Editor (Amstel V3.0)

El **AR Scene Editor** es una herramienta visual diseñada para componer, previsualizar y exportar la configuración de escenas de Realidad Aumentada (WebAR) de la campaña Amstel. Permite ubicar en el espacio 3D diferentes elementos digitales y definir en qué segundo exacto de la experiencia aparecerán.

---

## 0. Cómo Levantar el Editor (Servidor Local)

### Requisitos Previos
- **Node.js** v18 o superior instalado en tu computadora.
- **npm** (viene incluido con Node.js).

### Pasos para Iniciar
1. Abre una **terminal** (PowerShell, CMD, o terminal de VS Code).
2. Navega a la carpeta del editor:
   ```bash
   cd "D:\COMUNA-2026\demo-amstel\ar-scene-editor"
   ```
3. **Solo la primera vez** (o si se agregaron nuevas dependencias): instala los paquetes necesarios:
   ```bash
   npm install
   ```
4. Levanta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. El servidor arrancará y mostrará algo como:
   ```
   VITE v5.x.x  ready in 500ms
   ➜  Local: http://localhost:5174/
   ```
6. Abre tu navegador en **http://localhost:5174/** y el editor estará listo.

> **Nota:** Mientras el servidor esté corriendo, cualquier cambio que hagas en los archivos de código se reflejará automáticamente (Hot Reload). Para detener el servidor, presiona `Ctrl + C` en la terminal.

---

## 1. Conceptos Básicos

La interfaz está dividida en cuatro paneles principales:
1. **Header (Barra superior):** Gestión de escenas (Crear, Eliminar, Importar, Exportar).
2. **Jerarquía (Panel Izquierdo):** Lista de todos los elementos (Lotties, 3D, Videos, CTAs) presentes en la escena actual.
3. **Viewport 3D (Centro):** Visualizador espacial e interactivo donde puedes mover y escalar los objetos gráficamente.
4. **Inspector (Panel Derecho):** Controles precisos numéricos para ajustar posiciones, rotaciones, escalas y tiempos (Timeline) del elemento seleccionado.
5. **Timeline (Panel Inferior):** Representación visual de los tiempos de aparición de los elementos a lo largo de 10 segundos.

---

## 2. Gestión de Escenas (Scene Manager)

La aplicación soporta **múltiples escenas**, donde cada escena suele corresponder a un **Marker (Marcador de imagen)** diferente en el mundo físico.

- **Crear una nueva escena:** En la barra superior, pulsa el botón `+`. Se creará una nueva escena en blanco.
- **Cambiar de escena:** Usa el menú desplegable de la barra superior para alternar entre las escenas creadas.
- **Configurar la escena:** Si no seleccionas ningún elemento (haz clic en el fondo gris del Viewport 3D), el *Inspector* te mostrará la "Configuración de Escena".
  - **Nombre de Escena:** Un título descriptivo (ej. "Lata Amstel Dorada").
  - **Índice de Target Image:** Un número (ej. `0`, `1`, `2`) que indica qué imagen de destino (del archivo `targets.mind`) desencadenará esta escena en la cámara AR real.

---

## 3. Añadiendo Elementos

En la parte inferior izquierda de la **Jerarquía**, encontrarás botones para añadir distintos tipos de contenido: `Lottie`, `3D`, `Video`, y `CTA`.

Al hacer clic en cualquiera de ellos (excepto CTA), se abrirá el **Cuadro de Diálogo de Selección de Asset**.
Este cuadro de diálogo lee directamente de tu carpeta `webar/assets/` del proyecto. Selecciona el archivo que deseas utilizar para insertarlo en la vista 3D. 
> *Nota: Si el cuadro aparece vacío, necesitas copiar tus archivos `.json`, `.mp4` o `.gltf` en las subcarpetas `animations/`, `videos/` o `models/` dentro de `webar/assets/` en tu disco duro.*

### A. Animaciones Lottie
Al pulsar `Lottie` y elegir tu archivo (ej. `animacion.json`), el Lottie real comenzará a reproducirse en el Viewport 3D. Ya no verás un cubo imaginario, sino tu animación interactuando en el espacio 3D real de la herramienta.

**Preguntas Frecuentes sobre Lotties:**
- **¿Cómo debe estar el archivo Lottie?** Debe ser un archivo de extensión `.json` exportado desde Adobe After Effects usando el plugin Bodymovin o LottieFiles. Debe tener fondo transparente y estar optimizado.
- **¿Cada animación es un archivo Lottie diferente?** **Sí.** Es la mejor práctica. Si tienes una escena donde sale un logotipo girando, unas chispas saltando y un texto de "Felicidades", lo correcto es tener el logotipo en un `.json`, las chispas en otro `.json` y el texto en otro `.json`. Esto te permite usar el *AR Scene Editor* para posicionar las chispas más atrás, el texto más arriba y hacer que el logotipo aparezca en el segundo `0`, las chispas en el segundo `2` y el texto en el segundo `3`.

### B. Objetos 3D, Videos y Botones (CTA)
- Funciona exactamente igual. Al añadir un **Video** tendrás que seleccionar el `.mp4`, el cual se reproducirá al instante en un plano formato 16:9 en tu Viewport 3D. Al elegir **3D**, usarás el `.gltf` real.
- **CTAs (Call To Action):** No tienen archivos asociados. Al agregar un CTA, un botón tridimensional flotará en la escena y el Inspector revelará ajustes adicionales donde puedes escribir el "Texto" del botón y el "Link URL" hacia donde enviará al usuario.

---

## 4. Manipulación Gráfica: Mover, Rotar, Escalar

Hay dos formas de acomodar un elemento en tu escena. La forma más intuitiva es a través del **Viewport 3D**.

1. Selecciona un elemento haciendo clic en su nombre en la lista de Jerarquía izquierda, o haciendo clic sobre él en la vista 3D.
2. Tras seleccionarlo, aparecerá el **TransformControl** (unas flechas tridimensionales pegadas al objeto).
3. **Mover (Traslación):** Haz clic y arrastra la **flecha roja (Eje X, izquierda/derecha)**, la **verde (Eje Y, arriba/abajo)** o la **azul (Eje Z, adelante/atrás)** para posicionar el elemento en el espacio con respecto al Marker físico (que está en el centro 0,0,0).
4. Mientras arrastras en el visor 3D, notarás que los números en el **Inspector** de la derecha cambian en tiempo real.

---

## 5. Ajustes Precisos y Timeline (Inspector)

Si necesitas exactitud matemática o cambiar algo más que la posición, utiliza el **Inspector** (Panel derecho).

### Sección Transform
- **Position, Rotation, Scale:** Puedes teclear directamente los valores numéricos. Útil si quieres alinear dos objetos en la escala exacta de `X: 0, Y: 1.5, Z: 0` o darles la misma escala base (ej. `0.5`).

### Sección Timing (Timeline)
Aquí es donde le das vida a la coreografía de la Realidad Aumentada. Todo funciona en una línea de tiempo basada en segundos, asumiendo que el "segundo 0" es el momento exacto en el que el teléfono del usuario escanea y reconoce el marcador de Amstel.

- **Appear At (s):** En qué segundo exacto aparecerá este objeto empezando desde 0.
  - *Ejemplo:* Si pones `2`, el objeto permanecerá invisible durante los primeros 2 segundos después de reconocer la imagen, y luego aparecerá.
- **Fade In (s):** ¿Cuánto tiempo le tomará pasar de Transparente a Opaco? Controla la suavidad de entrada.
  - *Ejemplo:* Si `Appear At` es `2` y `Fade In` es `1`, el objeto empezará a desvanecerse en pantalla en el segundo 2, y estará completamente sólido en el segundo 3.

**El Panel Timeline (Inferior):**
A medida que ajustas el `Appear At` y el `Fade In`, verás barras inferiores cambiar dinámicamente:
- La **sección verde oscura** representa la transición o `Fade In`.
- La **sección azul clara** representa el momento en que el elemento ya está sólido y completamente visible.
- Esto te servirá para sincronizar varios Lotties entre sí, asegurando visualmente que un efecto de texto no aparezca antes de que termine un efecto de humo, por ejemplo.

---

## 6. Exportación para la Aplicación Principal

Una vez que tengas todas tus escenas, elementos, posiciones y sub-tiempos configurados, estás listo para llevar esto a producción.

1. Haz clic en el botón azul **"Exportar JSON"** en la esquina superior derecha.
2. Tu navegador descargará un archivo llamado `scenes.json`.
3. Este es el "cerebro y partitura" que consumirá tu aplicación de WebAR principal de la Fase 5A para renderizar los Lotties reales y los videos encima de los marcadores con todas las reglas que acabas de diseñar. 
4. **Respaldo:** Puedes usar el botón **Importar** para cargar un `.json` previo exportado y reanudar el trabajo donde lo dejaste en el futuro.
