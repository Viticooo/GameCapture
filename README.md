# Gary (Game Capture)

**[EN]** A minimalist, zero-latency UVC capture application for playing consoles on your PC.  
**[ES]** Una aplicación de captura UVC minimalista y sin latencia para jugar consolas en tu PC.

🌐 **Sitio Web Oficial / Official Website:** [garycapture.pages.dev](https://garycapture.pages.dev/)

![GameCapture App Preview](./ruta-a-tu-gif-de-la-app.gif) <!-- Reemplaza esto con un GIF de tu app en funcionamiento -->

---

## About / Acerca de

**[EN]** 
Tired of configuring complex software like OBS or PotPlayer just to play your Nintendo Switch on your monitor? **GameCapture** is a plug-and-play desktop application built to do one thing perfectly: display your USB capture card feed in full screen with absolute zero input lag.

**[ES]** 
¿Cansado de configurar software pesado como OBS o PotPlayer solo para jugar tu Nintendo Switch en el monitor? **Gary** es una aplicación de escritorio *plug-and-play* diseñada para hacer una sola cosa a la perfección: mostrar tu capturadora USB en pantalla completa con el mínimo retraso.

---

## Features / Características

- **Zero Input Lag:** Native UVC processing optimized for real-time gameplay. / *Procesamiento UVC nativo optimizado para jugar en tiempo real.*
- **Glassmorphism UI:** Clean, floating menus that hide automatically. / *Menús flotantes y limpios que se ocultan automáticamente.*
- **Ultra Lightweight:** Minimal CPU/GPU usage compared to traditional streaming software. / *Consumo mínimo de CPU/GPU frente al software de transmisión tradicional.*
- **Cross-Platform:** Available natively for Windows and Linux. / *Disponible de forma nativa para Windows y Linux.*

---

## Download & Install / Descarga e Instalación

**[EN]** You don't need to build the app to use it!
1. Go to the [Releases](../../releases) tab on the right.
2. Download the latest `.exe` (Windows) or `.AppImage` (Linux).
3. Connect your capture card, open the app, and play!

**[ES]** ¡No necesitas compilar el código para usarla!
1. Ve a la pestaña de [Releases](../../releases) a la derecha.
2. Descarga la última versión `.exe` (Windows) o `.AppImage` (Linux).
3. Conecta tu capturadora, abre la aplicación y a jugar!

---

## Tech Stack / Tecnologías

- **Electron** - Desktop environment / *Entorno de escritorio*
- **React + Vite** - Fast UI rendering / *Renderizado rápido de interfaz*
- **Tailwind CSS** - Styling and layout / *Estilos y diseño*

---

## For Developers / Para Desarrolladores

**[EN]** Want to contribute or build it yourself? 
**[ES]** ¿Quieres contribuir o compilarlo tú mismo?

```bash
# Clone the repository / Clonar el repositorio
git clone https://github.com/Viticooo/GameCapture.git

# Navigate to the folder / Entrar a la carpeta
cd GameCapture

# Install dependencies / Instalar dependencias
npm install

# Run in development mode / Ejecutar en modo desarrollo
npm run dev

# Build for Windows / Compilar para Windows
npm run build:win

# Build for Linux / Compilar para Linux
npm run build:linux
