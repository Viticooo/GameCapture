import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const HIDE_MENU_MS = 3000;
const api = typeof window !== "undefined" ? window.api : null;

/* ---------- Iconos ---------- */
const I = {
  video: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>,
  audio: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></svg>,
  muted: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></svg>,
  screen: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>,
  image: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" /><path d="M1 14h6M9 8h6M17 16h6" /></svg>,
  fx: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" /></svg>,
  win: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 12h14" /></svg>,
  fullscreen: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>,
  shrink: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>,
  cam: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  gauge: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15 8 9" /><circle cx="12" cy="14" r="8" /></svg>,
  close: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>,
};

const SIZE_PRESETS = [
  { label: "1280x720", w: 1280, h: 720 },
  { label: "1600x900", w: 1600, h: 900 },
  { label: "1920x1080", w: 1920, h: 1080 },
];

/* ---------- Dropdown personalizado (evita el popup nativo del select) ---------- */
function Dropdown({ label, value, placeholder, options, onChange, onOpenChange }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);

  const openMenu = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    setOpen(true);
  };

  useEffect(() => {
    onOpenChange(open);
    if (!open) return;
    const closeIfOutside = (e) => {
      const inBtn = btnRef.current?.contains(e.target);
      const inMenu = menuRef.current?.contains(e.target);
      if (!inBtn && !inMenu) setOpen(false);
    };
    const reposition = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    document.addEventListener("mousedown", closeIfOutside);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", closeIfOutside);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, onOpenChange]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-1">
      <span className={fieldLabel}>{label}</span>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`${control} min-w-[220px] flex items-center justify-between gap-2`}
      >
        <span className={value ? "text-amber-50" : "text-white/40"}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[60] max-h-64 overflow-auto rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/60"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                  o.value === value
                    ? "bg-amber-400/15 text-amber-100"
                    : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

/* ---------- Clases de estilo (ámbar suave / vidrio) ---------- */
const panel =
  "rounded-2xl bg-white/[0.05] backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/60";
const tab = "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer";
const tabActive = "bg-amber-400/15 text-amber-100 border border-amber-300/25";
const tabIdle = "text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent";
const control =
  "rounded-lg bg-white/[0.06] text-amber-50 px-2.5 py-1.5 outline-none border border-white/10 focus:border-amber-300/50 focus-visible:ring-2 focus-visible:ring-amber-300/40 text-xs transition-colors";
const btn =
  "rounded-lg bg-white/[0.06] border border-white/10 text-amber-50/90 hover:bg-white/[0.12] transition-colors focus-visible:ring-2 focus-visible:ring-amber-300/40";
const fieldLabel = "text-amber-200/60 text-[10px] uppercase tracking-wider font-medium";
const itemLabel = "text-[10px] text-white/40";
const toggleOn = "border-amber-300/60 bg-amber-400/20 text-amber-100";
const toggleOff = "border-white/10 hover:bg-white/[0.12]";

const SECTIONS = [
  { id: "video", label: "Video", icon: I.video },
  { id: "audio", label: "Audio", icon: I.audio },
  { id: "screen", label: "Pantalla", icon: I.screen },
  { id: "image", label: "Imagen", icon: I.image },
  { id: "fx", label: "Efectos", icon: I.fx },
  { id: "window", label: "Ventana", icon: I.win },
];

export default function App() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const hideTimer = useRef(null);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const dropdownOpenRef = useRef(false);

  // True mientras el menú o un dropdown estén en uso (evita re-renders que parpadeen)
  const menuActive = () => hoverRef.current || focusRef.current || dropdownOpenRef.current;

  const [videoInputs, setVideoInputs] = useState([]);
  const [audioInputs, setAudioInputs] = useState([]);
  const [videoId, setVideoId] = useState("");
  const [audioId, setAudioId] = useState("");
  const [showMenu, setShowMenu] = useState(true);
  const [activeSection, setActiveSection] = useState("video");
  const [devicesReady, setDevicesReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [crtMode, setCrtMode] = useState(false);
  const [showOsd, setShowOsd] = useState(false);
  const [fps, setFps] = useState(0);
  const [sizeLabel, setSizeLabel] = useState("");
  const [videoRes, setVideoRes] = useState({ w: 0, h: 0 });
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturate: 100 });
  const [frame, setFrame] = useState({ w: window.innerWidth, h: window.innerHeight });

  const videoResRef = useRef(videoRes);
  videoResRef.current = videoRes;

  // Sincronizar estado de pantalla completa con el proceso principal
  useEffect(() => {
    if (api?.onFullscreenChange) {
      const off = api.onFullscreenChange((value) => setIsFullscreen(value));
      return off;
    }
  }, []);

  // Atajos de teclado: B = CRT, F12 = captura
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "b" || e.key === "B") setCrtMode((c) => !c);
      if (e.key === "F12") {
        e.preventDefault();
        captureScreenshot();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setVideoInputs(devices.filter((d) => d.kind === "videoinput"));
        setAudioInputs(devices.filter((d) => d.kind === "audioinput"));
        setDevicesReady(true);
      })
      .catch((err) => console.error("enumerateDevices:", err));
  }, []);

  const startCapture = useCallback(
    async (vId = videoId, aId = audioId, manual = false) => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: vId ? { exact: vId } : undefined,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 60 },
          },
          audio: {
            deviceId: aId ? { exact: aId } : undefined,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            latency: 0,
          },
        });

        streamRef.current = stream;
        const el = videoRef.current;
        if (el) {
          el.srcObject = stream;
          el.volume = volume;
          el.muted = muted;
          el.play().catch((err) => console.error("play:", err));
        }

        if (manual) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          setVideoInputs(devices.filter((d) => d.kind === "videoinput"));
          setAudioInputs(devices.filter((d) => d.kind === "audioinput"));
        }
      } catch (err) {
        console.error("getUserMedia:", err);
      }
    },
    [videoId, audioId, volume, muted]
  );

  useEffect(() => {
    if (devicesReady && !streamRef.current) {
      startCapture();
    }
  }, [devicesReady, startCapture]);

  useEffect(() => {
    const el = videoRef.current;
    if (el) {
      el.muted = muted;
      el.volume = volume;
    }
  }, [volume, muted]);

  /* Medir FPS con rAF (bajo costo) */
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf;
    const loop = (t) => {
      frames += 1;
      if (t - last >= 500) {
        if (!menuActive()) setFps(Math.round((frames * 1000) / (t - last)));
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* Intervalo único para resolución y frame del video (evita recrear timers) */
  useEffect(() => {
    let lastFrameW = -1;
    let lastFrameH = -1;
    const update = () => {
      const v = videoRef.current;
      if (v && v.videoWidth) {
        const res = videoResRef.current;
        if (v.videoWidth !== res.w || v.videoHeight !== res.h) {
          if (!menuActive()) setVideoRes({ w: v.videoWidth, h: v.videoHeight });
        }
      }

      const W = window.innerWidth;
      const H = window.innerHeight;
      let fw = W;
      let fh = H;
      if (crtMode) {
        const ar = v && v.videoWidth ? v.videoWidth / v.videoHeight : 16 / 9;
        fw = W;
        fh = fw / ar;
        if (fh > H) {
          fh = H;
          fw = fh * ar;
        }
      }
      if (fw !== lastFrameW || fh !== lastFrameH) {
        lastFrameW = fw;
        lastFrameH = fh;
        if (!menuActive()) setFrame({ w: fw, h: fh });
      }
    };
    update();
    window.addEventListener("resize", update);
    const t = setInterval(update, 500);
    return () => {
      window.removeEventListener("resize", update);
      clearInterval(t);
    };
  }, [crtMode]);

  const resetHideTimer = useCallback(() => {
    setShowMenu(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!hoverRef.current && !focusRef.current && !dropdownOpenRef.current) setShowMenu(false);
    }, HIDE_MENU_MS);
  }, []);

  // Pausa el auto-ocultado mientras se interactúa (evita que los select se cierren)
  const pauseHide = useCallback(() => clearTimeout(hideTimer.current), []);

  // Mantiene el menú visible mientras un dropdown esté abierto
  const handleDropdownOpenChange = useCallback(
    (v) => {
      dropdownOpenRef.current = v;
      resetHideTimer();
    },
    [resetHideTimer]
  );

  useEffect(() => {
    resetHideTimer();
    window.addEventListener("mousemove", resetHideTimer);
    return () => {
      clearTimeout(hideTimer.current);
      window.removeEventListener("mousemove", resetHideTimer);
    };
  }, [resetHideTimer]);

  const onVideoChange = (v) => {
    setVideoId(v);
    startCapture(v, audioId, true);
  };

  const onAudioChange = (a) => {
    setAudioId(a);
    startCapture(videoId, a, true);
  };

  const toggleFullscreen = () => {
    if (api?.toggleFullscreen) api.toggleFullscreen();
    else setIsFullscreen((s) => !s);
  };

  const setWindowSize = (w, h) => {
    if (api?.setSize) api.setSize(w, h);
  };

  const onVolumeChange = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (v > 0 && muted) setMuted(false);
  };

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const resetFilters = () => setFilters({ brightness: 100, contrast: 100, saturate: 100 });

  const captureScreenshot = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d").drawImage(v, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    if (api?.savePng) {
      api.savePng(dataUrl.split(",")[1]);
    } else {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `gamecapture-${Date.now()}.png`;
      a.click();
    }
  };

  const filterStyle = {
    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%)`,
  };

  const SectionControls = ({ id }) => {
    switch (id) {
      case "video":
        return (
          <div className="flex flex-wrap items-end gap-4" style={{ WebkitAppRegion: "no-drag" }}>
            <div className="flex flex-col gap-1">
              <Dropdown
                label="Fuente de video"
                value={videoId}
                placeholder="Automático"
                options={videoInputs.map((d) => ({
                  value: d.deviceId,
                  label: d.label || `Dispositivo ${d.deviceId.slice(0, 8)}`,
                }))}
                onChange={onVideoChange}
                onOpenChange={handleDropdownOpenChange}
              />
            </div>
            <p className="text-[11px] text-white/35 max-w-[240px] leading-snug">
              Captura directa de la tarjeta UVC con latencia mínima (ideal 1920x1080 @ 60 fps).
            </p>
          </div>
        );
      case "audio":
        return (
          <div className="flex flex-wrap items-end gap-4" style={{ WebkitAppRegion: "no-drag" }}>
            <div className="flex flex-col gap-1">
              <Dropdown
                label="Fuente de audio"
                value={audioId}
                placeholder="Automático"
                options={audioInputs.map((d) => ({
                  value: d.deviceId,
                  label: d.label || `Dispositivo ${d.deviceId.slice(0, 8)}`,
                }))}
                onChange={onAudioChange}
                onOpenChange={handleDropdownOpenChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className={fieldLabel}>Volumen</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMuted((m) => !m)}
                  title={muted ? "Activar sonido" : "Silenciar"}
                  className={`${btn} p-2 ${muted ? toggleOn : toggleOff}`}
                >
                  {muted ? I.muted : I.audio}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={onVolumeChange}
                  title="Volumen"
                  className="w-32 accent-amber-400 cursor-pointer"
                />
                <span className="text-amber-50 text-xs tabular-nums w-8 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
            <p className="text-[11px] text-white/35 max-w-[220px] leading-snug">
              Sin eco, supresión de ruido ni ganancia automática para no alterar la señal.
            </p>
          </div>
        );
      case "screen":
        return (
          <div className="flex flex-wrap items-end gap-4" style={{ WebkitAppRegion: "no-drag" }}>
            <div className="flex flex-col gap-1">
              <Dropdown
                label="Tamaño de ventana"
                value={sizeLabel}
                placeholder="Selecciona"
                options={SIZE_PRESETS.map((p) => ({ value: p.label, label: p.label }))}
                onChange={(label) => {
                  setSizeLabel(label);
                  const p = SIZE_PRESETS.find((x) => x.label === label);
                  if (p) setWindowSize(p.w, p.h);
                }}
                onOpenChange={handleDropdownOpenChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className={fieldLabel}>Modo</span>
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? "Salir de pantalla completa (F11)" : "Pantalla completa (F11)"}
                className={`${btn} px-3 py-2 flex items-center gap-2 text-xs ${isFullscreen ? toggleOn : toggleOff}`}
              >
                {isFullscreen ? I.shrink : I.fullscreen}
                {isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              </button>
            </div>
            <p className="text-[11px] text-white/35 max-w-[200px] leading-snug">
              F11 también alterna. Arrastra la barra superior para mover la ventana.
            </p>
          </div>
        );
      case "image":
        return (
          <div className="flex flex-wrap items-end gap-4" style={{ WebkitAppRegion: "no-drag" }}>
            {[
              { key: "brightness", label: "Brillo", min: 50, max: 150 },
              { key: "contrast", label: "Contraste", min: 50, max: 150 },
              { key: "saturate", label: "Saturación", min: 0, max: 200 },
            ].map(({ key, label, min, max }) => (
              <div key={key} className="flex flex-col gap-1">
                <span className={fieldLabel}>{label}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={filters[key]}
                    onChange={(e) => setFilter(key, Number(e.target.value))}
                    className="w-28 accent-amber-400 cursor-pointer"
                  />
                  <span className="text-amber-50 text-xs tabular-nums w-8">{filters[key]}</span>
                </div>
              </div>
            ))}
            <button onClick={resetFilters} className={`${btn} px-3 py-2 text-xs`}>
              Restablecer
            </button>
            <p className="text-[11px] text-white/35 max-w-[180px] leading-snug">
              Filtros por GPU (CSS filter), sin impacto en la latencia de captura.
            </p>
          </div>
        );
      case "fx":
        return (
          <div className="flex flex-wrap items-end gap-4" style={{ WebkitAppRegion: "no-drag" }}>
            <div className="flex flex-col gap-1">
              <span className={fieldLabel}>Estilo</span>
              <button
                onClick={() => setCrtMode((c) => !c)}
                title="Modo CRT (B)"
                className={`${btn} px-3 py-2 flex items-center gap-2 text-xs ${crtMode ? toggleOn : toggleOff}`}
              >
                {I.fx}
                Modo CRT {crtMode ? "ON" : "OFF"}
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <span className={fieldLabel}>Herramientas</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOsd((s) => !s)}
                  title="Mostrar FPS y resolución"
                  className={`${btn} px-3 py-2 flex items-center gap-2 text-xs ${showOsd ? toggleOn : toggleOff}`}
                >
                  {I.gauge}
                  OSD
                </button>
                <button
                  onClick={captureScreenshot}
                  title="Captura de pantalla (F12)"
                  className={`${btn} px-3 py-2 flex items-center gap-2 text-xs`}
                >
                  {I.cam}
                  Captura
                </button>
              </div>
            </div>
            <p className="text-[11px] text-white/35 max-w-[200px] leading-snug">
              B activa el CRT. F12 guarda la captura. El OSD muestra FPS y resolución reales.
            </p>
          </div>
        );
      case "window":
        return (
          <div className="flex flex-wrap items-end gap-4" style={{ WebkitAppRegion: "no-drag" }}>
            <div className="flex flex-col gap-1">
              <span className={fieldLabel}>Acciones</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => api?.minimize()}
                  title="Minimizar"
                  className={`${btn} px-3 py-2 flex items-center gap-2 text-xs`}
                >
                  {I.win}
                  Minimizar
                </button>
                <button
                  onClick={() => api?.close()}
                  title="Cerrar"
                  className="px-3 py-2 rounded-lg bg-red-500/60 border border-red-300/30 text-white text-xs flex items-center gap-2 hover:bg-red-500 transition-colors"
                >
                  {I.close}
                  Cerrar
                </button>
              </div>
            </div>
            <p className="text-[11px] text-white/35 max-w-[200px] leading-snug">
              Minimiza al escritorio o cierra la aplicación.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Marco del video: centrado, con bordes negros cuando el CRT se activa */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`relative ${crtMode ? "overflow-hidden rounded-[28px]" : ""}`}
          style={{ width: frame.w, height: frame.h }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            style={filterStyle}
            autoPlay
            playsInline
          />
          {crtMode && <div className="pointer-events-none absolute inset-0 crt-overlay" />}
        </div>
      </div>

      {/* OSD: FPS + resolución real */}
      {showOsd && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-30 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 px-3 py-2 font-mono text-xs text-amber-200/80 leading-relaxed">
          <div>FPS: <span className="text-white">{fps}</span></div>
          <div>Res: <span className="text-white">{videoRes.w ? `${videoRes.w}x${videoRes.h}` : "—"}</span></div>
          <div>CRT: <span className="text-white">{crtMode ? "ON" : "OFF"}</span></div>
        </div>
      )}

      <div
        className={`fixed inset-x-0 top-0 z-20 transition-opacity duration-300 select-none ${
          showMenu ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-8 w-full cursor-move" style={{ WebkitAppRegion: "drag" }} />

        <div className="flex justify-center w-full px-2">
          <div
            className={`${panel} px-3 py-2.5 max-w-[98vw]`}
            style={{ WebkitAppRegion: "no-drag" }}
            onMouseEnter={() => {
              hoverRef.current = true;
              resetHideTimer();
            }}
            onMouseLeave={() => {
              hoverRef.current = false;
              resetHideTimer();
            }}
            onFocusCapture={() => {
              focusRef.current = true;
              resetHideTimer();
            }}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                focusRef.current = false;
                resetHideTimer();
              }
            }}
            onMouseDown={pauseHide}
            onMouseUp={resetHideTimer}
          >
            {/* Pestañas de sección */}
            <div className="flex flex-wrap justify-center gap-1">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection((cur) => (cur === s.id ? null : s.id))}
                  className={`${tab} ${activeSection === s.id ? tabActive : tabIdle}`}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>

            {/* Contenido de la sección activa */}
            <div
              className="overflow-hidden transition-all duration-200"
              style={{ maxHeight: activeSection ? 260 : 0, opacity: activeSection ? 1 : 0 }}
            >
              <div className="border-t border-white/10 mt-2 pt-3 pb-1">
                <SectionControls id={activeSection} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}