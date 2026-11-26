import { useEffect, useRef, useState } from 'react';

const preferenceKey = 'campo-minado:som';
type Outcome = 'won' | 'lost';

export function useGameSound() {
  const [enabled, setEnabled] = useState(false);
  const clips = useRef<Partial<Record<Outcome, HTMLAudioElement>>>({});

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem(preferenceKey) === 'on');
    } catch { /* O navegador pode bloquear o armazenamento local. */ }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const sounds = {
      won: new Audio('/sounds/won.wav'),
      lost: new Audio('/sounds/lost.wav'),
    };
    for (const sound of Object.values(sounds)) {
      sound.preload = 'auto';
      sound.volume = 0.6;
      sound.load();
    }
    clips.current = sounds;
    return () => {
      for (const sound of Object.values(sounds)) sound.pause();
      clips.current = {};
    };
  }, [enabled]);

  function toggle() {
    setEnabled(!enabled);
    try {
      localStorage.setItem(preferenceKey, enabled ? 'off' : 'on');
    } catch { /* A preferência continua válida nesta sessão. */ }
  }

  function stop() {
    for (const clip of Object.values(clips.current)) clip.pause();
  }

  function play(outcome: Outcome) {
    const clip = clips.current[outcome];
    if (!enabled || !clip) return;
    stop();
    clip.currentTime = 0;
    void clip.play().catch(() => { /* A partida continua se o navegador bloquear o áudio. */ });
  }

  return { enabled, toggle, play, stop };
}
