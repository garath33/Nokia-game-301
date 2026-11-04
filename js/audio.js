export function createAudio() {
  let ctx = null;
  let muted = false;

  function ac() {
    if (muted) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain, slide) {
    const audio = ac();
    if (!audio) return;
    const t = audio.currentTime;
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(amp);
    amp.connect(audio.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function noise(dur, gain) {
    const audio = ac();
    if (!audio) return;
    const count = Math.floor(audio.sampleRate * dur);
    const buffer = audio.createBuffer(1, count, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < count; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / count);
    const src = audio.createBufferSource();
    src.buffer = buffer;
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    const amp = audio.createGain();
    amp.gain.value = gain;
    src.connect(filter);
    filter.connect(amp);
    amp.connect(audio.destination);
    src.start();
  }

  return {
    get muted() {
      return muted;
    },
    setMuted(value) {
      muted = value;
    },
    resume() {
      ac();
    },
    click() {
      tone(520, 0.06, "square", 0.04, 740);
    },
    deny() {
      tone(180, 0.12, "square", 0.05, 90);
    },
    dig() {
      noise(0.07, 0.08);
    },
    shoot(enemy) {
      tone(enemy ? 210 : 640, 0.09, "square", 0.045, enemy ? 120 : 280);
    },
    hit(player) {
      tone(player ? 120 : 300, 0.14, "sawtooth", 0.05, 60);
    },
    tick() {
      tone(880, 0.04, "square", 0.03, 880);
    },
    win() {
      tone(523, 0.1, "square", 0.05, 523);
      setTimeout(() => tone(659, 0.1, "square", 0.05, 659), 90);
      setTimeout(() => tone(784, 0.16, "square", 0.05, 784), 180);
    },
    lose() {
      tone(220, 0.2, "sawtooth", 0.06, 70);
    },
  };
}
