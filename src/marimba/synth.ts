import { midiToFreq } from "./layout";

const PARTIALS = [
  { ratio: 1, amp: 1, decay: 1.65 },
  { ratio: 3.99, amp: 0.42, decay: 0.34 },
  { ratio: 9.2, amp: 0.16, decay: 0.12 },
  { ratio: 13.8, amp: 0.06, decay: 0.055 },
];

export class MarimbaSynth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private dry: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  volume = 0.82;
  hardness = 0.55;

  setVolume(volume: number): void {
    this.volume = volume;
    if (!this.master || !this.ctx) return;
    this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.03);
  }

  private ensure(): AudioContext {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = this.volume;
    const dry = ctx.createGain();
    dry.gain.value = 0.86;
    const wet = ctx.createGain();
    wet.gain.value = 0.32;
    const convolver = ctx.createConvolver();
    convolver.buffer = this.makeRoom(ctx);
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.knee.value = 18;
    compressor.ratio.value = 3.2;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.18;
    dry.connect(master);
    convolver.connect(wet);
    wet.connect(master);
    master.connect(compressor);
    compressor.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    this.dry = dry;
    this.convolver = convolver;
    return ctx;
  }

  private makeRoom(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 1.15);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        const envelope = (1 - i / length) ** 2.8;
        data[i] = (Math.random() * 2 - 1) * envelope;
      }
    }
    return impulse;
  }

  play(midi: number, velocity = 0.92): void {
    const ctx = this.ensure();
    if (ctx.state !== "running") void ctx.resume();
    const now = ctx.currentTime;
    const freq = midiToFreq(midi);
    const body = (220 / freq) ** 0.32;
    const bus = ctx.createGain();
    bus.connect(this.dry!);
    bus.connect(this.convolver!);

    for (const partial of PARTIALS) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      const target = freq * partial.ratio;
      osc.frequency.setValueAtTime(target * 1.015, now);
      osc.frequency.exponentialRampToValueAtTime(target, now + 0.035);
      const gain = ctx.createGain();
      const hardnessBoost = partial.ratio === 1 ? 1 : 0.45 + this.hardness;
      const peak = Math.max(0.0002, velocity * partial.amp * hardnessBoost * 0.32);
      const decay = Math.max(0.06, partial.decay * (partial.ratio === 1 ? body : 1));
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.007);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      osc.connect(gain);
      gain.connect(bus);
      osc.start(now);
      osc.stop(now + decay + 0.04);
    }

    const noiseDuration = 0.04;
    const frameCount = Math.max(1, Math.floor(ctx.sampleRate * noiseDuration));
    const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frameCount) ** 3;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1600 + this.hardness * 2400;
    filter.Q.value = 0.7;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = velocity * (0.12 + this.hardness * 0.28);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(bus);
    noise.start(now);
    noise.stop(now + noiseDuration);

    const releaseAt = (2.1 + body) * 1000;
    window.setTimeout(() => bus.disconnect(), releaseAt);
  }
}
