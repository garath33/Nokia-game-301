// Original loops, not borrowed tunes. Four short pieces share one scheduler.
// Each round picks a different song. Inside a song the second voice changes
// every pass, so a long round does not sit on the same color.

export const SONGS = [
  {
    name: "Pochod",
    bpm: 112,
    bar: 8,
    swing: 0,
    slide: 0.99,
    minor: false,
    leadWave: "square",
    leadGain: 0.017,
    hat: "off",
    kick: "back",
    lead: [
      69, 72, 76, 72, 69, 67, 69, 72,
      76, 79, 76, 74, 72, 69, 67, 64,
      65, 69, 72, 69, 65, 64, 62, 64,
      67, 72, 69, 67, 65, 64, 62, 60,
      74, 77, 81, 77, 74, 72, 74, 77,
      81, 84, 81, 79, 77, 74, 72, 69,
      72, 76, 79, 81, 79, 76, 74, 72,
      69, 67, 69, 72, 71, 69, 67, 64,
    ],
    bass: [
      45, 0, 45, 0, 41, 0, 41, 0,
      43, 0, 43, 0, 40, 0, 38, 0,
      41, 0, 41, 0, 36, 0, 38, 0,
      43, 0, 45, 0, 41, 0, 40, 0,
      50, 0, 50, 0, 45, 0, 47, 0,
      48, 0, 48, 0, 45, 0, 43, 0,
      45, 0, 48, 0, 50, 0, 47, 0,
      45, 0, 43, 0, 41, 0, 40, 0,
    ],
  },
  {
    name: "Bažina",
    bpm: 86,
    bar: 8,
    swing: 0.06,
    slide: 0.95,
    minor: true,
    leadWave: "triangle",
    leadGain: 0.02,
    lowpass: 1100,
    hat: "sparse",
    kick: "back",
    lead: [
      69, 0, 72, 69, 76, 0, 74, 72,
      69, 0, 67, 0, 65, 64, 62, 0,
      65, 0, 69, 65, 72, 0, 71, 69,
      67, 65, 64, 0, 62, 0, 60, 0,
      72, 0, 76, 72, 79, 0, 77, 76,
      74, 0, 72, 0, 71, 69, 67, 0,
      76, 74, 72, 71, 69, 0, 67, 65,
      64, 0, 65, 67, 69, 0, 67, 64,
    ],
    bass: [
      45, 0, 0, 0, 45, 0, 52, 0,
      41, 0, 0, 0, 41, 0, 48, 0,
      43, 0, 0, 0, 43, 0, 47, 0,
      40, 0, 0, 0, 38, 0, 45, 0,
      48, 0, 0, 0, 48, 0, 55, 0,
      46, 0, 0, 0, 46, 0, 53, 0,
      41, 0, 0, 0, 43, 0, 47, 0,
      40, 0, 0, 0, 45, 0, 40, 0,
    ],
  },
  {
    name: "Rychlík",
    bpm: 144,
    bar: 4,
    swing: 0.16,
    slide: 1,
    minor: false,
    leadWave: "square",
    leadGain: 0.015,
    hat: "drive",
    kick: "four",
    lead: [
      72, 0, 76, 79, 76, 0, 72, 67,
      74, 0, 77, 81, 77, 0, 74, 69,
      76, 79, 76, 72, 74, 0, 79, 0,
      81, 79, 77, 76, 74, 72, 71, 72,
      84, 0, 81, 79, 76, 0, 79, 81,
      84, 81, 79, 76, 74, 0, 72, 0,
      74, 77, 81, 77, 74, 72, 69, 0,
      67, 0, 72, 76, 79, 76, 72, 67,
    ],
    bass: [
      48, 0, 55, 0, 48, 52, 0, 48,
      50, 0, 57, 0, 50, 53, 0, 50,
      43, 0, 50, 0, 43, 47, 0, 55,
      48, 0, 52, 0, 43, 0, 47, 48,
      41, 0, 48, 0, 53, 0, 48, 0,
      46, 0, 53, 0, 46, 50, 0, 43,
      45, 0, 52, 0, 45, 49, 0, 45,
      48, 43, 45, 47, 48, 0, 36, 0,
    ],
  },
  {
    name: "Kolébka",
    bpm: 104,
    bar: 6,
    swing: 0,
    slide: 0.98,
    minor: false,
    leadWave: "triangle",
    leadGain: 0.018,
    hat: "waltz",
    kick: "waltz",
    lead: [
      64, 67, 72, 67, 71, 67,
      69, 72, 76, 72, 74, 69,
      71, 74, 79, 74, 76, 71,
      72, 76, 72, 67, 64, 60,
      76, 79, 84, 79, 81, 76,
      77, 81, 84, 81, 79, 74,
      72, 76, 79, 76, 74, 71,
      69, 72, 76, 72, 67, 64,
    ],
    bass: [
      48, 0, 0, 55, 0, 0,
      41, 0, 0, 48, 0, 0,
      43, 0, 0, 50, 0, 0,
      36, 0, 0, 43, 0, 48,
      52, 0, 0, 59, 0, 0,
      53, 0, 0, 46, 0, 50,
      48, 0, 0, 55, 0, 52,
      45, 0, 0, 48, 0, 43,
    ],
  },
];

for (const song of SONGS) {
  if (song.lead.length !== song.bass.length || song.lead.length < 32) {
    throw new Error(`Špatná délka skladby ${song.name}`);
  }
}

export function pickSongIndex(current, count, rng) {
  if (count <= 1) return 0;
  let next = Math.floor(Number(rng()) * count);
  if (!Number.isInteger(next) || next < 0 || next >= count) next = 0;
  if (next === current) next = (next + 1) % count;
  return next;
}

export function createAudio() {
  let ctx = null;
  let musicEnabled = true;
  let effectsOn = true;
  let unlocked = false;
  let musicTimer = null;
  let musicOn = false;
  let nextNote = 0;
  let stepIndex = 0;
  let pass = 0;
  let songIndex = Math.floor(Math.random() * SONGS.length);
  let lastQuack = 0;
  let voices = [];

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function sfx() {
    if (!effectsOn) return null;
    return ac();
  }

  function outlet(audio, pan) {
    if (!pan || typeof audio.createStereoPanner !== "function") return audio.destination;
    const node = audio.createStereoPanner();
    node.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), audio.currentTime);
    node.connect(audio.destination);
    return node;
  }

  function track(node) {
    voices.push(node);
    node.onended = () => {
      const index = voices.indexOf(node);
      if (index >= 0) voices.splice(index, 1);
    };
  }

  function silenceVoices() {
    const pending = voices;
    voices = [];
    const when = ctx ? ctx.currentTime + 0.03 : 0;
    for (const node of pending) {
      try {
        node.stop(when);
      } catch {
        /* already ended */
      }
    }
  }

  function toneAt(audio, when, freq, dur, type, gain, slide, pan, tracked, lowpass) {
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), when + dur);
    amp.gain.setValueAtTime(gain, when);
    amp.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    let dest = outlet(audio, pan);
    if (lowpass) {
      const filter = audio.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(lowpass, when);
      filter.connect(dest);
      dest = filter;
    }
    osc.connect(amp);
    amp.connect(dest);
    osc.start(when);
    osc.stop(when + dur + 0.02);
    if (tracked) track(osc);
  }

  function tone(freq, dur, type, gain, slide, pan) {
    const audio = sfx();
    if (!audio) return;
    toneAt(audio, audio.currentTime, freq, dur, type, gain, slide, pan, false, 0);
  }

  function noise(dur, gain, freq, pan) {
    const audio = sfx();
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
    amp.connect(outlet(audio, pan));
    src.start();
  }

  function midi(note) {
    return 440 * 2 ** ((note - 69) / 12);
  }

  function accentOf(song, index) {
    if (index % song.bar === 0) return 1.22;
    if (song.bar === 6 && index % 6 === 3) return 1.08;
    if (song.bar !== 6 && index % (song.bar / 2) === 0) return 1.08;
    return 0.94;
  }

  function shade(song, index) {
    const lead = song.lead[index];
    if (!lead) return 0;
    const cycle = pass % 3;
    if (cycle === 1 && index % 4 === 0) return lead + (song.minor ? -3 : -4);
    if (cycle === 2 && index % 8 === 4) return lead <= 76 ? lead + 12 : lead - 12;
    return 0;
  }

  function hatAt(audio, when, gain) {
    const count = Math.max(1, Math.floor(audio.sampleRate * 0.03));
    const buffer = audio.createBuffer(1, count, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < count; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / count);
    const src = audio.createBufferSource();
    src.buffer = buffer;
    const filter = audio.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1800, when);
    const amp = audio.createGain();
    amp.gain.setValueAtTime(gain, when);
    amp.gain.exponentialRampToValueAtTime(0.0001, when + 0.03);
    src.connect(filter);
    filter.connect(amp);
    amp.connect(audio.destination);
    src.start(when);
    src.stop(when + 0.04);
    track(src);
  }

  function hatOn(song, index) {
    if (song.hat === "sparse") return index % 8 === 4;
    if (song.hat === "waltz") return index % 3 === 2;
    if (song.hat === "drive") return index % 2 === 1;
    return index % 2 === 1;
  }

  function kickOn(song, index) {
    if (song.kick === "waltz") return index % 6 === 0;
    if (song.kick === "four") return index % 4 === 0;
    return index % 8 === 0 || index % 8 === 4;
  }

  function scheduleStep(audio, song, index, when) {
    const accent = accentOf(song, index);
    const step = 60 / song.bpm / 2;
    const bass = song.bass[index];
    const lead = song.lead[index];
    const harm = shade(song, index);
    if (bass) {
      const ring = song.bass[index + 1] ? step * 0.9 : Math.min(step * 1.8, 0.46);
      toneAt(audio, when, midi(bass), ring, "triangle", 0.028 * accent, 0, 0, true, 0);
    }
    if (lead) {
      const next = song.lead[index + 1] || 0;
      const dur = Math.min(next === 0 ? step * 1.45 : next === lead ? step * 1.15 : step * 0.86, 0.42);
      const slide = song.slide && song.slide !== 1 ? midi(lead) * song.slide : 0;
      toneAt(audio, when, midi(lead), dur, song.leadWave, song.leadGain * accent, slide, 0, true, song.lowpass || 0);
    }
    if (harm) {
      toneAt(audio, when, midi(harm), Math.min(step * 0.8, 0.24), "triangle", 0.008 * accent, 0, 0, true, song.lowpass || 0);
    }
    if (hatOn(song, index)) hatAt(audio, when, 0.01 * accent);
    if (kickOn(song, index)) toneAt(audio, when, 128, 0.08, "sine", 0.022 * accent, 52, 0, true, 0);
  }

  function pump() {
    if (!musicOn) return;
    const audio = ac();
    if (!audio) {
      musicOn = false;
      return;
    }
    const song = SONGS[songIndex];
    const stepDur = 60 / song.bpm / 2;
    if (nextNote < audio.currentTime) nextNote = audio.currentTime + 0.05;
    while (nextNote < audio.currentTime + 0.45) {
      const when = nextNote + (song.swing && stepIndex % 2 === 1 ? stepDur * song.swing : 0);
      scheduleStep(audio, song, stepIndex, when);
      stepIndex += 1;
      if (stepIndex >= song.lead.length) {
        stepIndex = 0;
        pass += 1;
      }
      nextNote += stepDur;
    }
    musicTimer = setTimeout(pump, 90);
  }

  function startMusic() {
    if (musicOn || !musicEnabled || !unlocked) return;
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
    silenceVoices();
  }

  return {
    get music() {
      return musicEnabled;
    },
    get effects() {
      return effectsOn;
    },
    get song() {
      return SONGS[songIndex].name;
    },
    setMusic(value) {
      musicEnabled = !!value;
      if (!musicEnabled) stopMusic();
      else if (unlocked) startMusic();
    },
    setEffects(value) {
      effectsOn = !!value;
    },
    nextRound() {
      songIndex = pickSongIndex(songIndex, SONGS.length, Math.random);
      stepIndex = 0;
      pass = 0;
      if (!musicOn) return;
      silenceVoices();
      if (ctx) nextNote = ctx.currentTime + 0.05;
    },
    resume() {
      unlocked = true;
      ac();
      if (musicEnabled) startMusic();
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
    shoot(enemy, pan) {
      noise(0.045, enemy ? 0.05 : 0.07, enemy ? 500 : 900, pan || 0);
      tone(enemy ? 420 : 920, 0.07, "square", enemy ? 0.05 : 0.07, enemy ? 140 : 210, pan || 0);
      tone(enemy ? 180 : 280, 0.09, "triangle", 0.04, 70, pan || 0);
    },
    quack() {
      const now = performance.now();
      if (now - lastQuack < 2000) return;
      const audio = sfx();
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
