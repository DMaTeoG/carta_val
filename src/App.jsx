import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  Stethoscope, 
  Sparkles, 
  Moon, 
  Stars, 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  FileText, 
  Activity, 
  ChevronRight, 
  RotateCcw, 
  Check, 
  Eye, 
  Pill, 
  Sparkle, 
  Dna, 
  X 
} from 'lucide-react';

export default function App() {
  const [stage, setStage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  const defaultLetter = 
`Quién diría que una fiesta de Halloween terminaría siendo el lugar donde te conocería.

Me gusta esa mezcla tan bonita que tienes entre lo tierna y divertida. Espero que sigas esa espontaneidad, que te animes a mis planes locos y que nunca te falten ganas de seguirme el ambiente JAJAJA.

Sé que la medicina ocupa gran parte de tu tiempo, así que espero que nunca te falten motivos para sonreír, incluso en esos días en los que los libros y las clases parecen no terminar.

No sé qué pueda surgir de todo esto, pero sí me gustaría seguir conociéndote, 

Por ahora, solo quería dejarte este pequeño detalle y sacarte una sonrisa.

Con cariño Mateo.`;

  // State
  const [recipientName, setRecipientName] = useState(() => {
    const stored = localStorage.getItem('recipient_name');
    if (!stored || stored === 'Mi Futura Doctora Favorita' || stored === 'Kimberly (Val)' || stored === 'Valentina') {
      localStorage.setItem('recipient_name', 'Valeria');
      return 'Valeria';
    }
    return stored;
  });

  const [senderName, setSenderName] = useState(() => {
    const stored = localStorage.getItem('sender_name');
    if (!stored || stored === 'Alguien que no deja de pensar en ti') {
      localStorage.setItem('sender_name', 'Mateo');
      return 'Mateo';
    }
    return stored;
  });

  const [letterContent, setLetterContent] = useState(() => {
    const stored = localStorage.getItem('letter_content');
    if (!stored || stored.includes('Hoy no es un día cualquiera')) {
      localStorage.setItem('letter_content', defaultLetter);
      return defaultLetter;
    }
    return stored;
  });

  // Music Player State (Milo J - M.A.I at 0:46)
  const [isPlaying, setIsPlaying] = useState(false);
  const ytPlayerRef = useRef(null);
  const [ytReady, setYtReady] = useState(false);
  const [hasStartedAuto, setHasStartedAuto] = useState(false);

  // Fallback Web Audio Synth
  const audioContextRef = useRef(null);
  const synthIntervalRef = useRef(null);

  // Stage 2 Interactive Nodes unlocked
  const [unlockedNodes, setUnlockedNodes] = useState([]);
  const [bpm, setBpm] = useState(78);
  const [pulseCount, setPulseCount] = useState(0);

  // Stage 3 Envelope open state
  const [envelopeOpened, setEnvelopeOpened] = useState(false);

  // Canvas starfield animation
  const canvasRef = useRef(null);

  // Initialize YouTube IFrame API for Milo J - M.A.I
  useEffect(() => {
    const initYT = () => {
      if (window.YT && window.YT.Player) {
        new window.YT.Player('youtube-audio-player', {
          videoId: 'MldGX_mbS-o',
          playerVars: {
            start: 46,
            autoplay: 0,
            controls: 0,
            playsinline: 1,
            loop: 1,
            playlist: 'MldGX_mbS-o',
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              ytPlayerRef.current = event.target;
              event.target.seekTo(46, true);
              setYtReady(true);
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
              }
            },
          },
        });
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initYT;
    } else {
      initYT();
    }
  }, []);

  // Music toggle handler
  const toggleMusic = () => {
    if (ytPlayerRef.current) {
      try {
        const state = ytPlayerRef.current.getPlayerState();
        if (state === 1) { // 1 = playing
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          // If first time or ended, make sure it starts at second 46
          if (state === -1 || state === 0 || state === 5) {
            ytPlayerRef.current.seekTo(46, true);
          }
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        }
        return;
      } catch (e) {
        console.warn("YouTube player control fallback", e);
      }
    }

    // Fallback synthesizer if YouTube player is not ready
    if (isPlaying) {
      stopCelestialSynth();
    } else {
      startCelestialSynth();
    }
  };

  const playSongFrom46 = () => {
    if (!hasStartedAuto && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(46, true);
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
        setHasStartedAuto(true);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Fallback Procedural Celestial Audio
  const startCelestialSynth = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const scale = [185.0, 220.0, 246.94, 277.18, 329.63, 369.99, 440.0, 493.88, 554.37, 659.25];
      let step = 0;

      const playNote = (freq, duration = 2.5) => {
        if (!ctx || ctx.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      };

      synthIntervalRef.current = setInterval(() => {
        const noteIndex = (step * 3) % scale.length;
        playNote(scale[noteIndex], 3.5);
        if (Math.random() > 0.4) {
          playNote(scale[(noteIndex + 4) % scale.length], 4.0);
        }
        step++;
      }, 700);

      setIsPlaying(true);
    } catch (e) {
      console.warn("Audio Context init fallback", e);
    }
  };

  const stopCelestialSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  };

  // Ultra-Dynamic Starfield Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const starCount = Math.floor((width * height) / 2200);
    const stars = Array.from({ length: starCount }, () => {
      const isGold = Math.random() > 0.7;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.8 + 0.4,
        baseAlpha: Math.random() * 0.7 + 0.3,
        alpha: Math.random(),
        fadeSpeed: Math.random() * 0.02 + 0.005,
        fadeIn: Math.random() > 0.5,
        isGold: isGold,
        hasCross: Math.random() > 0.85,
      };
    });

    const shootingStars = [];
    const createShootingStar = () => {
      if (shootingStars.length < 3 && Math.random() < 0.04) {
        shootingStars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.5),
          len: Math.random() * 100 + 60,
          speed: Math.random() * 10 + 7,
          angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
          alpha: 1,
        });
      }
    };

    const dustParticles = Array.from({ length: 25 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -Math.random() * 0.5 - 0.2,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.3,
        80,
        width * 0.5,
        height * 0.5,
        width * 0.9
      );
      gradient.addColorStop(0, '#0f1738');
      gradient.addColorStop(0.4, '#080d21');
      gradient.addColorStop(1, '#02040a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Connect stars
      for (let i = 0; i < stars.length; i += 3) {
        for (let j = i + 1; j < stars.length; j += 4) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            const lineAlpha = (1 - dist / 85) * 0.12 * Math.min(stars[i].alpha, stars[j].alpha);
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(245, 208, 97, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        if (star.fadeIn) {
          star.alpha += star.fadeSpeed;
          if (star.alpha >= star.baseAlpha) {
            star.fadeIn = false;
          }
        } else {
          star.alpha -= star.fadeSpeed;
          if (star.alpha <= 0.05) {
            star.fadeIn = true;
            if (Math.random() > 0.6) {
              star.x = Math.random() * width;
              star.y = Math.random() * height;
            }
          }
        }

        const a = Math.max(0, Math.min(1, star.alpha));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.isGold 
          ? `rgba(245, 208, 97, ${a})` 
          : `rgba(224, 235, 255, ${a})`;
        ctx.shadowBlur = star.isGold ? 10 * a : 5 * a;
        ctx.shadowColor = star.isGold ? '#F5D061' : '#A0C4FF';
        ctx.fill();

        if (star.hasCross && a > 0.5) {
          const arm = star.radius * 3.5 * a;
          ctx.beginPath();
          ctx.moveTo(star.x - arm, star.y);
          ctx.lineTo(star.x + arm, star.y);
          ctx.moveTo(star.x, star.y - arm);
          ctx.lineTo(star.x + arm, star.y);
          ctx.strokeStyle = star.isGold ? `rgba(255, 230, 153, ${a * 0.7})` : `rgba(255, 255, 255, ${a * 0.7})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      dustParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 208, 97, ${p.alpha * 0.4})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#F5D061';
        ctx.fill();
      });

      createShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.len * Math.cos(s.angle), s.y - s.len * Math.sin(s.angle));
        ctx.strokeStyle = `rgba(245, 208, 97, ${s.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#F5D061';
        ctx.stroke();

        s.x += s.speed * Math.cos(s.angle);
        s.y += s.speed * Math.sin(s.angle);
        s.alpha -= 0.022;

        if (s.alpha <= 0 || s.x > width || s.y > height) {
          shootingStars.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const triggerStarConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#F5D061', '#E5B869', '#FFE699', '#38BDF8', '#F43F5E'],
      shapes: ['star', 'circle'],
      scalar: 1.2,
    });
  };

  const nodes = [
    {
      id: 'vocacion',
      title: 'Vocación & Corazón',
      icon: Stethoscope,
      accent: 'text-cyan-400',
      tag: 'Ciencia & Ternura',
      text: 'Tu dedicación a la medicina no es solo una carrera: es tu forma de regalarle luz a las personas. Tienes el corazón más noble para cuidar a los demás.',
    },
    {
      id: 'luz',
      title: 'Tu Brillo Natural',
      icon: Moon,
      accent: 'text-gold-400',
      tag: 'Noche de Estrellas',
      text: 'Tienes una sonrisa que calma cualquier guardia difícil. Iluminas más que una noche despejada en medio de la nada.',
    },
    {
      id: 'sintonia',
      title: 'Nuestra Sintonía',
      icon: Music,
      accent: 'text-rose-400',
      tag: 'Milo J - M.A.I',
      text: 'Tu personalidad tiene ese compás perfecto: auténtica, profunda y con un estilo que se te queda grabado en el pecho todo el día.',
    },
    {
      id: 'latido',
      title: 'Diagnóstico Preliminar',
      icon: Heart,
      accent: 'text-pink-400',
      tag: 'Signos Vitales',
      text: 'Alteración del pulso detectada: es imposible verte sonreír y que el corazón no se acelere de forma involuntaria.',
    },
  ];

  const handleUnlockNode = (id) => {
    if (!unlockedNodes.includes(id)) {
      setUnlockedNodes([...unlockedNodes, id]);
      triggerStarConfetti();
    }
  };

  const handleHeartbeatClick = () => {
    setPulseCount(prev => prev + 1);
    setBpm(prev => (prev < 145 ? prev + 12 : 82));
    triggerStarConfetti();
  };

  const openEnvelope = () => {
    setEnvelopeOpened(true);
    const end = Date.now() + 1500;
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F5D061', '#E5B869', '#38BDF8'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#F5D061', '#E5B869', '#F43F5E'],
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col items-center justify-between overflow-x-hidden w-full selection:bg-gold-500 selection:text-space-900">
      {/* Background Starfield */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Hidden YouTube IFrame Player (Audio Only) */}
      <div 
        id="youtube-audio-player" 
        className="pointer-events-none absolute -top-[9999px] -left-[9999px] w-1 h-1 opacity-0"
      />

      {/* Floating Header */}
      <header className="sticky top-2 sm:top-4 z-40 w-full max-w-4xl px-3 sm:px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 bg-space-800/80 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gold-500/30 shadow-lg shadow-black/40">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-gold-600 to-amber-300 flex items-center justify-center text-space-900 shadow-md animate-pulse">
            <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="text-left">
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-gold-400 font-semibold flex items-center gap-1">
              <span>Receta Médica & Estrellas</span>
              <Sparkles className="w-3 h-3 text-gold-300 inline" />
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-400">Edición Especial de Cumpleaños</p>
          </div>
        </div>

        {/* Ambient Player Button: Milo J - M.A.I */}
        <button
          onClick={toggleMusic}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md transition-all duration-300 shadow-md ${
            isPlaying
              ? 'bg-gold-500/20 border-gold-400 text-gold-300 shadow-gold-500/20'
              : 'bg-space-800/80 border-slate-700 text-slate-300 hover:border-gold-500/50'
          }`}
          title="Toca para reproducir Milo J - M.A.I (0:46)"
        >
          <div className="flex items-center gap-1">
            {isPlaying ? (
              <span className="flex gap-0.5 items-end h-3.5">
                <span className="w-1 bg-gold-400 animate-[bounce_1s_infinite_100ms] rounded-full h-full"></span>
                <span className="w-1 bg-gold-400 animate-[bounce_1s_infinite_300ms] rounded-full h-2"></span>
                <span className="w-1 bg-gold-400 animate-[bounce_1s_infinite_200ms] rounded-full h-3"></span>
              </span>
            ) : (
              <Play className="w-3.5 h-3.5 fill-current text-gold-400" />
            )}
          </div>
          <span className="text-[11px] sm:text-xs font-mono">
            {isPlaying ? 'Milo J - M.A.I' : 'Milo J - M.A.I (0:46)'}
          </span>
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-4xl px-3 sm:px-6 py-4 sm:py-8 flex-1 flex flex-col items-center justify-center">
        
        {/* ============================================================== */}
        {/* ETAPA 1: BIENVENIDA */}
        {/* ============================================================== */}
        {stage === 1 && (
          <div className="w-full max-w-xl text-center space-y-6 sm:space-y-7 animate-fade-in py-2 sm:py-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-400/30 text-gold-300 text-[11px] sm:text-xs tracking-widest uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Noche de Celebración • Constelaciones Vivas</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <div className="space-y-2 px-2">
              <h1 className="text-3xl sm:text-5xl font-serif-celestial font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-200 to-gold-400 text-glow-gold leading-tight">
                Feliz Cumpleaños, <br />
                <span className="italic font-script text-4xl sm:text-6xl text-gold-200 drop-shadow-[0_0_20px_rgba(245,208,97,0.5)]">
                  {recipientName}
                </span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-base max-w-md mx-auto font-light leading-relaxed">
                El universo tiene miles de millones de estrellas, pero ninguna brilla con tanta gracia, inteligencia y calidez como tú.
              </p>
            </div>

            {/* FIRST IMAGE FEATURE: MICROSCOPE TISSUE HEART */}
            <div className="relative max-w-md mx-auto w-full group px-1">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-pink-500/30 via-gold-500/30 to-cyan-500/30 rounded-3xl blur-md group-hover:blur-lg transition-all duration-500"></div>
              
              <div className="relative glass-card rounded-2xl p-4 sm:p-5 border border-gold-400/50 shadow-2xl text-left space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-700/60">
                  <span className="flex items-center gap-1.5 text-pink-400 font-semibold uppercase tracking-wider text-[11px] sm:text-xs">
                    <Dna className="w-3.5 h-3.5 text-pink-400 animate-pulse" /> Hallazgo Histológico Confidencial
                  </span>
                  <span className="text-gold-300 font-mono text-[10px] sm:text-[11px] bg-space-900/80 px-2 py-0.5 rounded border border-gold-500/30">
                    Aumento 40x
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <div 
                    onClick={() => setSelectedPhoto('microscope')}
                    className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-amber-300/80 overflow-hidden shadow-2xl shadow-pink-500/20 cursor-pointer flex-shrink-0 group-hover:scale-105 transition-transform duration-300 bg-black"
                    title="Haz clic para ampliar la muestra"
                  >
                    <img 
                      src="microscope_heart.jpg" 
                      alt="Corazón en el microscopio" 
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-1">
                      <span className="text-[10px] text-white/90 flex items-center gap-1 font-mono">
                        <Eye className="w-3 h-3" /> Ver detalle
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left">
                    <p className="text-xs font-semibold text-gold-300 flex items-center justify-center sm:justify-start gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
                      <span>Evidencia Clínica Irrefutable:</span>
                    </p>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      "Hasta bajo el microscopio, tus células de medicina decidieron alinearse en forma de corazón. La ciencia y el destino sabían que estabas hecha para robarte el mío."
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                      Estado: Diagnóstico de amor incurable
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button: Starts music automatically from second 46 if not yet played */}
            <div className="pt-2">
              <button
                onClick={() => {
                  playSongFrom46();
                  setStage(2);
                  triggerStarConfetti();
                }}
                className="group relative inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 text-space-900 font-semibold text-sm sm:text-base shadow-xl shadow-gold-500/30 hover:shadow-gold-400/50 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
              >
                <span>Explorar tus Estrellas</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              * Toca con calma y déjate sorprender paso a paso.
            </p>
          </div>
        )}

        {/* ============================================================== */}
        {/* ETAPA 2: CONSTELACIONES & EKG */}
        {/* ============================================================== */}
        {stage === 2 && (
          <div className="w-full space-y-6 sm:space-y-8 animate-fade-in py-2 max-w-xl">
            
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[11px] uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>Etapa II: Signos Vitales & Cualidades</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif-celestial font-bold text-gold-300 text-glow-gold">
                Constelaciones que Hablan de Ti
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Toca cada constelación para calibrar tu diagnóstico y desbloquear el sobre sellado.
              </p>
            </div>

            {/* 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {nodes.map((node) => {
                const isUnlocked = unlockedNodes.includes(node.id);
                const IconComponent = node.icon;
                return (
                  <div
                    key={node.id}
                    onClick={() => handleUnlockNode(node.id)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 border text-left ${
                      isUnlocked
                        ? 'bg-space-800/90 border-gold-400/80 shadow-lg shadow-gold-500/15 scale-[1.01]'
                        : 'glass-card border-slate-700/60 hover:border-gold-500/40 opacity-80 hover:opacity-100 hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div className={`p-2 rounded-xl bg-space-900/80 border border-slate-700/80 ${node.accent}`}>
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                        isUnlocked
                          ? 'border-gold-400/60 bg-gold-500/20 text-gold-300'
                          : 'border-slate-700 bg-space-900/60 text-slate-400'
                      }`}>
                        {isUnlocked ? 'Revelada' : 'Tocar para ver'}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-slate-100 mb-0.5 flex items-center gap-1.5">
                      {node.title}
                      {isUnlocked && <Sparkle className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mb-1.5">{node.tag}</p>

                    <p className={`text-xs leading-relaxed transition-all duration-300 ${
                      isUnlocked ? 'text-slate-200' : 'text-slate-500 blur-[2px] select-none'
                    }`}>
                      {node.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* EKG Monitor */}
            <div className="glass-card max-w-md mx-auto p-4 rounded-2xl border border-cyan-500/30 space-y-2.5 shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-rose-400 font-semibold uppercase tracking-wider text-[11px]">
                  <Activity className="w-4 h-4 animate-pulse" /> Electrocardiograma de Emoción
                </span>
                <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 text-xs">
                  {bpm} BPM
                </span>
              </div>

              <div className="h-12 sm:h-14 w-full bg-space-900/90 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-800">
                <svg className="w-full h-full text-rose-500" viewBox="0 0 500 80" preserveAspectRatio="none">
                  <path
                    d="M0,40 L100,40 L115,25 L125,55 L135,10 L145,70 L155,35 L165,45 L175,40 L280,40 L295,20 L305,60 L315,5 L325,75 L335,30 L345,50 L355,40 L500,40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="ekg-line drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between pt-1 gap-2">
                <p className="text-[11px] text-slate-400 truncate">
                  {pulseCount === 0 
                    ? 'Toca para medir el pulso que provocas:'
                    : `Latidos registrados: Taquicardia (${pulseCount})`}
                </p>
                <button
                  onClick={handleHeartbeatClick}
                  className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 active:scale-95 flex-shrink-0"
                >
                  <Heart className="w-3.5 h-3.5 fill-current animate-ping" />
                  <span>Palpitar</span>
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="text-center space-y-3 pt-1">
              <div className="text-xs text-slate-400">
                Progreso: <span className="text-gold-400 font-bold">{unlockedNodes.length} de 4</span> constelaciones
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-2.5">
                <button
                  onClick={() => setStage(1)}
                  className="px-4 py-2.5 rounded-full border border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors order-2 sm:order-1"
                >
                  Volver a portada
                </button>

                <button
                  onClick={() => {
                    setStage(3);
                    triggerStarConfetti();
                  }}
                  disabled={unlockedNodes.length < 2}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 order-1 sm:order-2 ${
                    unlockedNodes.length >= 2
                      ? 'bg-gradient-to-r from-gold-500 to-amber-400 text-space-900 shadow-lg shadow-gold-500/30 hover:scale-105 active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <span>Abrir Expediente Confidencial</span>
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ETAPA 3: SOBRE SELLADO CON CERA DORADA & EXPEDIENTE */}
        {/* ============================================================== */}
        {stage === 3 && (
          <div className="w-full max-w-xl animate-fade-in py-1 space-y-5 text-center">
            
            {/* Toolbar */}
            <div className="flex items-center justify-between px-1">
              <button
                onClick={() => setStage(2)}
                className="text-xs text-slate-400 hover:text-gold-300 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Volver a constelaciones
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={triggerStarConfetti}
                  className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-400/40 text-gold-300 text-xs flex items-center gap-1 hover:bg-gold-500/20 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Estrellas
                </button>
              </div>
            </div>

            {/* UNOPENED ENVELOPE */}
            {!envelopeOpened ? (
              <div className="max-w-md mx-auto py-4 sm:py-6 space-y-4 animate-float px-1">
                <div 
                  onClick={openEnvelope}
                  className="group relative cursor-pointer rounded-2xl bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-2 border-gold-400/50 p-6 sm:p-8 shadow-2xl shadow-gold-500/20 hover:border-gold-400 transition-all duration-300 text-center space-y-4"
                >
                  <div className="text-[11px] sm:text-xs uppercase font-mono tracking-widest text-gold-400 font-semibold">
                    Expediente Confidencial & Carta Personal
                  </div>

                  <p className="text-sm text-slate-300 font-light">
                    Para: <span className="text-gold-200 font-medium">{recipientName}</span>
                  </p>

                  <div className="relative inline-block my-2">
                    <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-amber-500 via-gold-500 to-amber-700 shadow-xl shadow-gold-600/50 flex flex-col items-center justify-center border-4 border-amber-300 group-hover:scale-110 active:scale-95 transition-transform duration-300">
                      <Stethoscope className="w-8 h-8 text-space-900" />
                      <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600 absolute bottom-3" />
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] sm:text-[11px] font-mono text-gold-300 bg-space-900/90 px-2.5 py-0.5 rounded border border-gold-500/40">
                      Toca el sello para abrir
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 pt-3">
                    Emitido bajo el influjo de las estrellas y un corazón emocionado.
                  </p>
                </div>
              </div>
            ) : (
              /* OPENED PRESCRIPTION & LETTER */
              <div className="w-full prescription-paper text-slate-800 rounded-2xl p-4 sm:p-8 shadow-2xl border-2 sm:border-4 border-amber-200/80 text-left space-y-4 sm:space-y-5 animate-fade-in relative overflow-hidden">
                
                {/* Header */}
                <div className="border-b-2 border-slate-300 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-rose-700 font-bold text-base sm:text-lg tracking-tight">
                      <Heart className="w-5 h-5 fill-rose-600 text-rose-600 flex-shrink-0" />
                      <span>HOSPITAL GENERAL DE LAS ESTRELLAS</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      DEPARTAMENTO DE CARDIOLOGÍA EMOCIONAL & FELICIDAD
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400">Folio: CUMPLE-2026-MED • Registro Estelar Auténtico</p>
                  </div>
                  <div className="self-end sm:self-auto text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[10px] sm:text-xs font-bold border border-rose-300">
                      CONFIDENCIAL
                    </span>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 font-mono">
                      FECHA: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Patient Information Table */}
                <div className="bg-white/80 rounded-xl p-3 border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 shadow-sm font-sans">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">PACIENTE DE HONOR:</span>
                    <span className="text-slate-900 font-bold text-sm">{recipientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">PROFESIÓN & VOCACIÓN:</span>
                    <span className="text-slate-800 font-medium">Futura Doctora Brillante</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">FRECUENCIA CARDÍACA:</span>
                    <span className="text-rose-600 font-bold font-mono">140 BPM (Enamoramiento Agudo)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">SOUNDTRACK INDICADO:</span>
                    <span className="text-slate-800 font-medium">Milo J - M.A.I (0:46)</span>
                  </div>
                </div>

                {/* SECOND IMAGE: POLAROID IN MEDICAL CHART */}
                <div className="bg-amber-50/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <div 
                    onClick={() => setSelectedPhoto('gym')}
                    className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden border-2 border-white shadow-md bg-black flex-shrink-0 cursor-pointer group hover:scale-105 transition-transform"
                    title="Haz clic para ver foto completa"
                  >
                    <img 
                      src="gym_heart.jpg" 
                      alt="Corazón y fuerza" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="space-y-1 text-center sm:text-left">
                    <span className="inline-block px-2 py-0.5 rounded bg-rose-200/80 text-rose-800 text-[10px] font-bold font-mono uppercase">
                      Anexo Fotográfico #01
                    </span>
                    <p className="text-xs font-bold text-slate-800">
                      Evidencia de Fuerza & Corazón
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "Para recordarte que aquí siempre tienes a alguien con la fuerza y las ganas de cuidarte, celebrar cada guardia aprobada y recordarte lo especial que eres."
                    </p>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="space-y-1">
                  <p className="text-xs font-bold text-rose-700 tracking-wide uppercase flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-rose-600" /> Diagnóstico Definitivo:
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 bg-amber-50/80 p-3 rounded-lg border-l-4 border-amber-500 italic">
                    "Paciente diagnosticada con una sonrisa terapéutica irresistible, inteligencia admirable y la capacidad de detener el tiempo con su sola presencia."
                  </p>
                </div>

                {/* Prescription (Rx) */}
                <div className="space-y-2 border-t border-b border-dashed border-slate-300 py-2.5">
                  <p className="text-xs font-bold text-slate-800 tracking-wider flex items-center gap-1.5 font-mono">
                    <Pill className="w-4 h-4 text-cyan-600" /> TRATAMIENTO PRESCRITO (Rx):
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-1 sm:pl-2">
                    <li className="flex items-start gap-2">
                      <span className="text-gold-600 font-bold">1.</span>
                      <span><strong>Dosis masiva de abrazos y risas:</strong> Administrar sin límite todos los días de este nuevo año.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold-600 font-bold">2.</span>
                      <span><strong>Cero estrés en tus guardias y exámenes:</strong> Recordar siempre que eres capaz de lograr todo lo que te propongas.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold-600 font-bold">3.</span>
                      <span><strong>Momento especial diario:</strong> Poner tu canción favorita de Milo J y sonreír.</span>
                    </li>
                  </ul>
                </div>

                {/* Personal Letter */}
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-bold text-slate-800 tracking-wider font-mono flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" /> NOTA MÉDICA PERSONAL:
                  </p>
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line bg-white/60 p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
                    {letterContent}
                  </div>
                </div>

                {/* Signature */}
                <div className="pt-3 flex flex-row items-end justify-between border-t border-slate-300 gap-2">
                  <div className="border-2 border-dashed border-rose-400 rounded-xl p-1.5 sm:p-2 text-center rotate-[-3deg] bg-rose-50/60">
                    <p className="text-[9px] sm:text-[10px] font-mono font-bold text-rose-700 uppercase">APROBADO CON TODO EL CARIÑO</p>
                    <p className="text-[8px] sm:text-[9px] text-rose-500">Válido de por vida</p>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="font-script text-xl sm:text-2xl text-slate-900 border-b border-slate-400 pb-0.5 inline-block">
                      {senderName}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono block">Firma del Remitente</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 text-center flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    onClick={triggerStarConfetti}
                    className="w-full sm:w-auto px-4 py-2 rounded-full bg-slate-900 text-gold-300 font-semibold text-xs shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    <span>Lanzar Estrellas Doradas</span>
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(letterContent);
                        alert("Carta copiada al portapapeles");
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-full border border-slate-400 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
                  >
                    Copiar texto
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in"
        >
          <div className="relative max-w-lg w-full bg-space-900 rounded-2xl border border-gold-400/60 p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedPhoto === 'microscope' ? 'microscope_heart.jpg' : 'gym_heart.jpg'} 
              alt="Foto ampliada" 
              className="w-full h-auto max-h-[72vh] object-contain rounded-xl"
            />
            <p className="text-center text-xs text-gold-300 font-mono pt-2.5 pb-0.5">
              {selectedPhoto === 'microscope' 
                ? 'Células en forma de corazón • Muestra clínica de amor'
                : 'Fuerza y corazón dedicado para ti'}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full py-3 sm:py-4 text-center text-[10px] sm:text-[11px] text-slate-400 border-t border-slate-800/80 bg-space-900/60 backdrop-blur-sm px-2">
        <p className="flex items-center justify-center gap-1">
          <span>Hecho especialmente bajo las estrellas</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          <span>para {recipientName}</span>
        </p>
      </footer>
    </div>
  );
}
