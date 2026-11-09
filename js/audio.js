// Original 8-bit loop. Not a borrowed tune: a short square-wave march
// that sits under the shots and the quack.
const MELODY = [
  69, 72, 76, 72, 69, 67, 69, 72,
  76, 79, 76, 74, 72, 69, 67, 64,
  65, 69, 72, 69, 65, 64, 62, 64,
  67, 72, 69, 67, 65, 64, 62, 60,
];
const BASS = [
  45, 0, 45, 0, 41, 0, 41, 0,
  43, 0, 43, 0, 40, 0, 38, 0,
  41, 0, 41, 0, 36, 0, 38, 0,
  43, 0, 45, 0, 41, 0, 40, 0,
];

export function createAudio() {
  let ctx = null;
  let muted = false;
  let unlocked = false;
  let musicTimer = null;
  let musicOn = false;
  let nextNote = 0;
  let stepIndex = 0;
  let lastQuack = 0;

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

  function toneAt(audio, when, freq, dur, type, gain, slide) {
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), when + dur);
    amp.gain.setValueAtTime(gain, when);
    amp.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(amp);
    amp.connect(audio.destination);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  function tone(freq, dur, type, gain, slide) {
    const audio = ac();
    if (!audio) return;
    toneAt(audio, audio.currentTime, freq, dur, type, gain, slide);
  }

  function noise(dur, gain, freq) {
    const audio = ac();
    if (!audio) return;
    const count = Math.max(1, Math.floor(audio.sampleRate * dur));
    const buffer = audio.createBuffer(1, count, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < count; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / count);
    const src = audio.createBufferSource();
    src.buffer = buffer;
    const filter = audio.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = freq || 700;
    const amp = audio.createGain();
    amp.gain.value = gain;
    src.connect(filter);
    filter.connect(amp);
    amp.connect(audio.destination);
    src.start();
  }

  function midi(note) {
    return 440 * 2 ** ((note - 69) / 12);
  }

  function scheduleStep(audio, index, when) {
    const bass = BASS[index];
    const lead = MELODY[index];
    if (bass) toneAt(audio, when, midi(bass), 0.2, "triangle", 0.03);
    if (lead) toneAt(audio, when, midi(lead), 0.16, "square", 0.018, midi(lead) * 0.99);
    if (index % 2 === 1) {
      const count = Math.floor(audio.sampleRate * 0.03);
      const buffer = audio.createBuffer(1, count, audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < count; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / count);
      const src = audio.createBufferSource();
      src.buffer = buffer;
      const amp = audio.createGain();
      amp.gain.setValueAtTime(0.012, when);
      amp.gain.exponentialRampToValueAtTime(0.0001, when + 0.03);
      src.connect(amp);
      amp.connect(audio.destination);
      src.start(when);
    }
  }

  function pump() {
    if (!musicOn) return;
    const audio = ac();
    if (!audio) {
      musicOn = false;
      return;
    }
    if (nextNote < audio.currentTime) nextNote = audio.currentTime + 0.05;
    const stepDur = 60 / 112 / 2;
    while (nextNote < audio.currentTime + 0.28) {
      scheduleStep(audio, stepIndex, nextNote);
      stepIndex = (stepIndex + 1) % MELODY.length;
      nextNote += stepDur;
    }
    musicTimer = setTimeout(pump, 90);
  }

  function startMusic() {
    if (musicOn || muted || !unlocked) return;
    const audio = ac();
    if (!audio) return;
    musicOn = true;
    nextNote = audio.currentTime + 0.06;
    pump();
  }

  function stopMusic() {
    musicOn = false;
    if (musicTimer) clearTimeout(musicTimer);
    musicTimer = null;
  }

  return {
    get muted() {
      return muted;
    },
    setMuted(value) {
      muted = value;
      if (muted) stopMusic();
      else if (unlocked) startMusic();
    },
    resume() {
      unlocked = true;
      if (!muted) {
        ac();
        startMusic();
      }
    },
    click() {
      tone(520, 0.06, "square", 0.04, 740);
    },
    deny() {
      tone(180, 0.12, "square", 0.05, 90);
    },
    dig() {
      noise(0.07, 0.08, 400);
    },
    shoot(enemy) {
      noise(0.045, enemy ? 0.05 : 0.07, enemy ? 500 : 900);
      tone(enemy ? 420 : 920, 0.07, "square", enemy ? 0.05 : 0.07, enemy ? 140 : 210);
      tone(enemy ? 180 : 280, 0.09, "triangle", 0.04, 70);
    },
    quack() {
      const now = performance.now();
      if (now - lastQuack < 2000) return;
      const audio = ac();
      if (!audio) return;
      lastQuack = now;
      const t = audio.currentTime;
      const osc = audio.createOscillator();
      const filter = audio.createBiquadFilter();
      const amp = audio.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(780, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(640, t + 0.1);
      osc.frequency.exponentialRampToValueAtTime(210, t + 0.22);
      filter.type = "bandpass";
      filter.Q.value = 7;
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(480, t + 0.22);
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(0.11, t + 0.02);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      osc.connect(filter);
      filter.connect(amp);
      amp.connect(audio.destination);
      osc.start(t);
      osc.stop(t + 0.26);
    },
    hit(player) {
      tone(player ? 120 : 300, 0.14, "sawtooth", 0.05, 60);
    },
    tick() {
      tone(880, 0.04, "square", 0.03, 880);
    },
    boon() {
      tone(523, 0.08, "square", 0.05, 659);
      setTimeout(() => tone(659, 0.08, "square", 0.05, 784), 90);
      setTimeout(() => tone(784, 0.08, "square", 0.06, 988), 180);
      setTimeout(() => tone(1046, 0.22, "square", 0.07, 1318), 280);
    },
    win() {
      tone(523, 0.1, "square", 0.05, 523);
      setTimeout(() => tone(659, 0.1, "square", 0.05, 659), 90);
      setTimeout(() => tone(784, 0.16, "square", 0.05, 784), 180);
    },
    triumph() {
      tone(523, 0.12, "square", 0.06, 523);
      setTimeout(() => tone(659, 0.12, "square", 0.06, 659), 120);
      setTimeout(() => tone(784, 0.12, "square", 0.06, 784), 240);
      setTimeout(() => tone(1046, 0.28, "square", 0.07, 1318), 380);
    },
    lose() {
      tone(220, 0.2, "sawtooth", 0.06, 70);
    },
  };
}
