# GameCapture — Agent Guide

Electron + React + Vite + Tailwind CSS v4 app for viewing Nintendo Switch capture cards with ultra-low latency. UI is in Spanish.

## Commands

| Action | Command |
|---|---|
| Full dev (Vite + Electron) | `npm run dev` |
| Vite dev server only | `npm run dev:vite` or `npm run dev:web` |
| Electron only (waits for Vite) | `npm run dev:electron` |
| Production build (Vite only) | `npm run build` |
| Run built app | `npm run start` |
| Build Windows installer | `npm run build:win` |
| Build Linux packages | `npm run build:linux` |

There are no tests, linter, formatter, or typecheck configured.

## Architecture

- **`electron/main.cjs`** — Electron main process (CommonJS). Creates a frameless, fullscreen BrowserWindow. Dev mode loads `localhost:5173`; production loads `dist/index.html`.
- **`electron/preload.cjs`** — Context-isolated bridge exposing `window.api` (IPC calls to main).
- **`src/App.jsx`** — Single React component containing all UI and capture logic.
- **`src/main.jsx`** — React entry point.
- **`src/index.css`** — Tailwind import + CRT scanline overlay effect.
- **`index.html`** — Vite HTML entry (`<html lang="es">`).

This is a small single-component app. There is no routing, no state library, no component tree.

## Key Gotchas

- **No TypeScript, no ESLint, no Prettier** — code style is the file's existing conventions.
- **Tailwind CSS v4** — uses `@tailwindcss/vite` plugin (not PostCSS). Config is just `@import "tailwindcss"` in CSS.
- **`base: "./"` in vite.config.mjs** — required for `file://` protocol in packaged Electron. Do not change.
- **Electron main is CommonJS** (`.cjs`) while the app is ESM (`"type": "module"` in package.json). Keep this split.
- **`window.api`** — all Electron IPC is accessed through this preload-exposed object. The renderer has no direct `ipcRenderer` access.
- **Frameless window** — custom drag region (`WebkitAppRegion: "drag"`) is the 8px bar at the top. Controls use `WebkitAppRegion: "no-drag"`.
- **Vite dev server must be on port 5173** — Electron hardcodes `http://localhost:5173` and `wait-on` depends on it.
