// Optional browser features must never prevent a family from reading.
export function createBedtimeServices() {
  let audio, wakeLock, reading = false, requesting = false;
  async function acquire() {
    if (!reading || document.visibilityState !== 'visible' || wakeLock || requesting || !navigator.wakeLock) return;
    requesting = true;
    try {
      const lock = await navigator.wakeLock.request('screen');
      if (!reading || document.visibilityState !== 'visible') await lock.release();
      else {
        wakeLock = lock;
        lock.addEventListener('release', () => { if (wakeLock === lock) wakeLock = null; });
      }
    } catch { /* Unsupported, refused, or low battery: normal screen behavior. */ }
    finally { requesting = false; }
  }
  document.addEventListener('visibilitychange', acquire);
  return {
    async setReading(value) {
      reading = value;
      if (value) await acquire();
      else if (wakeLock) { const lock = wakeLock; wakeLock = null; try { await lock.release(); } catch {} }
    },
    sound(kind, enabled) {
      if (!enabled) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        audio ||= new AudioContext();
        void audio.resume().catch(() => {});
        const gain = audio.createGain(); gain.connect(audio.destination);
        const now = audio.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(kind === 'turn' ? 0.025 : 0.045, now + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (kind === 'turn' ? 0.16 : 0.7));
        let source;
        if (kind === 'turn') {
          source = audio.createBufferSource();
          const buffer = audio.createBuffer(1, audio.sampleRate * 0.18, audio.sampleRate);
          const samples = buffer.getChannelData(0);
          for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
          source.buffer = buffer;
          const filter = audio.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 900;
          source.connect(filter); filter.connect(gain);
        } else {
          source = audio.createOscillator(); source.type = 'sine'; source.frequency.value = 523.25;
          source.connect(gain);
        }
        source.start(now); source.stop(now + 0.8);
        source.onended = () => { source.disconnect(); gain.disconnect(); };
      } catch { /* Sound is optional. */ }
    },
  };
}
