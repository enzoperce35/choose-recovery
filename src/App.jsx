import React, { useState, useEffect, useRef } from 'react';
import Recovery from './Recovery';
import { pickRandomScene } from './sceneLines';

const SCENE_LINES = [
  {
    text: "Tandaan Mo",
    delay: 0,
    style: "text-2xl md:text-4xl text-stone-300 font-normal"
  },
  {
    text: "Sa Unang Taya Ka lang may control",
    delay: 1600,
    style: "text-3xl md:text-5xl text-stone-100 font-bold tracking-tight"
  },
  {
    text: "Ang mga susunod?",
    delay: 3400,
    style: "text-xl md:text-3xl text-stone-400 italic pt-2"
  },
  {
    text: "Sila na.",
    delay: 5400,
    style: "text-3xl md:text-5xl text-amber-300/90 font-semibold tracking-[0.18em] pt-4 border-t border-stone-800/80 max-w-xs mx-auto"
  },
];

export default function App() {
  const [view, setView] = useState('pause');
  const [scene, setScene] = useState(() => pickRandomScene());
  const [runId, setRunId] = useState(0);

  const [phase, setPhase] = useState('tataya');
  const [visibleLines, setVisibleLines] = useState(0);
  const [groundedVisible, setGroundedVisible] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [audioActive, setAudioActive] = useState(false);
  const audioCtxRef = useRef(null);

  const startGroundingAudio = async () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;

      // If context already exists, resume it if the browser suspended it
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume();
        }
        if (audioCtxRef.current.state === 'running') {
          setAudioActive(true);
        }
        return;
      }

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const baseOsc = ctx.createOscillator();
      const baseGain = ctx.createGain();
      baseOsc.type = 'sine';
      baseOsc.frequency.setValueAtTime(136.1, ctx.currentTime);
      baseGain.gain.setValueAtTime(0.001, ctx.currentTime);
      baseGain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 2.5);
      baseOsc.connect(baseGain);
      baseGain.connect(ctx.destination);
      baseOsc.start();

      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(68.05, ctx.currentTime);
      subGain.gain.setValueAtTime(0.001, ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 3);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start();

      // Attempt immediate resume in case browser created it in suspended state
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      setAudioActive(ctx.state === 'running');
    } catch {
      setAudioActive(false);
    }
  };

  const stopAudio = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
      setAudioActive(false);
    }
  };

  useEffect(() => {
    if (view !== 'pause') return;
    startGroundingAudio();

    setPhase('tataya');
    const t1 = setTimeout(() => setPhase('bakit'), 2200);
    const t2 = setTimeout(() => setPhase('scenes'), 4400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [view, runId]);

  useEffect(() => () => stopAudio(), []);

  useEffect(() => {
    if (view !== 'pause' || phase !== 'scenes') return;

    setVisibleLines(0);
    const timers = SCENE_LINES.map((line, index) =>
      setTimeout(() => setVisibleLines(index + 1), line.delay)
    );

    const endSceneTimer = setTimeout(() => setPhase('grounded'), 8600);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(endSceneTimer);
    };
  }, [view, phase]);

  useEffect(() => {
    if (view !== 'pause' || phase !== 'grounded') {
      setGroundedVisible(false);
      return;
    }
    const fadeTimer = setTimeout(() => setGroundedVisible(true), 150);
    return () => clearTimeout(fadeTimer);
  }, [view, phase]);

  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathPhase((prev) => (prev === 'Inhale' ? 'Exhale' : 'Inhale'));
    }, 4000);
    return () => clearInterval(breathInterval);
  }, []);

  const handleRestartPause = () => {
    setScene((prev) => pickRandomScene(prev));
    setVisibleLines(0);
    setGroundedVisible(false);
    setView('pause');
    setRunId((id) => id + 1);
  };

  if (view === 'recovery') {
    return <Recovery onBack={handleRestartPause} />;
  }

  return (
    <div
      onPointerDown={startGroundingAudio}
      className="relative min-h-screen bg-[#0D0F12] text-[#EAE6DF] flex flex-col items-center justify-between py-10 px-6 overflow-hidden select-none"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#07080A_100%)]" />
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl pointer-events-none transition-all duration-[4000ms] ease-in-out ${phase === 'grounded'
          ? 'bg-emerald-950/20 w-[520px] h-[520px]'
          : 'bg-red-950/15 w-[480px] h-[480px]'
          } ${breathPhase === 'Inhale' ? 'scale-110 opacity-90' : 'scale-75 opacity-40'}`}
      />

      {/* Top Breathing Cue */}
      <div className="relative z-10 flex items-center space-x-3 opacity-70">
        <span
          className={`w-2 h-2 rounded-full transition-transform duration-[4000ms] ${breathPhase === 'Inhale' ? 'scale-150 bg-amber-200' : 'scale-75 bg-stone-500'
            }`}
        />
        <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-stone-400">
          {breathPhase}
        </span>
      </div>

      {/* CENTER STAGE */}
      <div className="relative z-10 w-full max-w-3xl flex items-center justify-center my-auto min-h-[340px]">
        {(phase === 'tataya' || phase === 'bakit') && (
          <div className="relative w-full flex items-center justify-center">
            <h1
              className={`font-serif text-5xl md:text-7xl font-bold tracking-tight text-stone-100 transition-all duration-1000 ease-in-out ${phase === 'tataya'
                ? 'opacity-100 translate-x-0 scale-100'
                : 'opacity-0 -translate-x-48 scale-95 pointer-events-none'
                }`}
            >
              Tataya ka?
            </h1>

            <h1
              className={`absolute font-serif text-6xl md:text-8xl font-bold tracking-tight text-red-400 transition-all duration-1000 ease-out ${phase === 'bakit'
                ? 'opacity-100 translate-x-0 scale-100'
                : 'opacity-0 translate-x-32 scale-95 pointer-events-none'
                }`}
            >
              Bakit?
            </h1>
          </div>
        )}

        {phase === 'scenes' && (
          <div className="w-full space-y-5 md:space-y-7 text-center px-2">
            {scene.map((line, idx) => (
              <p
                key={idx}
                className={`font-serif transition-all duration-1000 ease-out transform ${line.style
                  } ${idx < visibleLines
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
              >
                {line.text}
              </p>
            ))}
          </div>
        )}

        {phase === 'grounded' && (
          <div className="text-center space-y-6 max-w-xl">
            <p className="font-serif text-4xl md:text-6xl text-stone-100 font-semibold leading-snug opacity-0 animate-[settle_700ms_ease-out_forwards]">
              Huwag mo nang ituloy.
            </p>

            <p className="font-serif text-lg md:text-xl text-stone-300 leading-relaxed opacity-0 animate-[fadeUp_600ms_ease-out_900ms_forwards]">
              Isara mo na ang browser na ito. Piliin mo ang sarili mo ngayon.
            </p>

            <div className="pt-4 opacity-0 animate-[fadeUp_600ms_ease-out_1600ms_forwards]">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  stopAudio();
                  setView('recovery');
                }}
                className="px-8 py-3 rounded-full border border-emerald-400/50 bg-emerald-900/20 font-serif text-xl md:text-2xl text-emerald-200 tracking-wide hover:bg-emerald-800/30 hover:border-emerald-300/70 transition-all duration-300 cursor-pointer"
              >
                Choose Recovery
              </button>
            </div>

            <div className="pt-6 flex items-center justify-center opacity-0 animate-[fadeUp_600ms_ease-out_2200ms_forwards]">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleRestartPause}
                className="px-6 py-3 rounded-lg border border-stone-800 text-stone-500 hover:text-stone-300 hover:border-stone-600 font-mono text-xs tracking-wider uppercase transition-colors cursor-pointer"
              >
                Basahin ulit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Progress / Audio Unlock Cue */}
      <div className="relative z-10 h-8 flex items-center justify-center mb-12 md:mb-0 pb-[env(safe-area-inset-bottom)]">
        {!audioActive ? (
          <span className="font-mono text-[11px] text-amber-300/70 tracking-widest uppercase animate-pulse">
            Tap anywhere for grounding sound
          </span>
        ) : (
          <div className="w-24 h-[2px] bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-stone-500 transition-all duration-1000 ${phase === 'tataya'
                  ? 'w-1/4'
                  : phase === 'bakit'
                    ? 'w-2/4'
                    : phase === 'scenes'
                      ? 'w-3/4'
                      : 'w-full bg-emerald-700/70'
                }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
