// Short original synthesized cues: no recording, music download, or autoplay.
export class AudioController {
  private context: AudioContext | null = null;
  private voices = new Set<OscillatorNode>();
  enabled = false;
  async toggle() {
    if (this.enabled) {
      this.enabled = false;
      this.stop();
      return false;
    }
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      this.enabled = this.context.state === "running";
      if (this.enabled) this.cue("register");
    } catch {
      this.enabled = false;
    }
    return this.enabled;
  }
  cue(kind: "register" | "charge" | "burst") {
    if (!this.enabled || !this.context || this.context.state !== "running")
      return;
    const ctx = this.context,
      now = ctx.currentTime;
    const oscillator = ctx.createOscillator(),
      gain = ctx.createGain();
    const duration = kind === "burst" ? 0.28 : kind === "charge" ? 0.8 : 0.1;
    oscillator.type = kind === "charge" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(
      kind === "charge" ? 90 : kind === "burst" ? 340 : 720,
      now,
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      kind === "charge" ? 400 : 45,
      now + duration,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(ctx.destination);
    this.voices.add(oscillator);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      this.voices.delete(oscillator);
    };
    oscillator.start();
    oscillator.stop(now + duration);
  }
  stop() {
    this.voices.forEach((v) => {
      try {
        v.stop();
      } catch {
        /* already ended */
      }
    });
    this.voices.clear();
  }
  dispose() {
    this.stop();
    void this.context?.close();
    this.context = null;
  }
}
