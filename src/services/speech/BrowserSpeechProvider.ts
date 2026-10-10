import { SupportedLanguage } from '../medicalTranslationEngine';
import { ISpeechProvider, SpeakOptions, SpeechVoiceInfo, SpeechChunk } from './types';

export class BrowserSpeechProvider implements ISpeechProvider {
  public readonly name = 'browser' as const;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;
  private voiceListeners: Array<() => void> = [];
  private activeToken: number = 0;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private keepAliveInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices(): void {
    if (!this.synth) return;
    const loaded = this.synth.getVoices();
    if (loaded && loaded.length > 0) {
      this.voices = loaded;
      this.voicesLoaded = true;
      this.voiceListeners.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
    }
  }

  public onVoicesLoaded(callback: () => void): () => void {
    if (this.voicesLoaded) {
      callback();
    }
    this.voiceListeners.push(callback);
    return () => {
      this.voiceListeners = this.voiceListeners.filter((fn) => fn !== callback);
    };
  }

  public isAvailable(): boolean {
    return Boolean(this.synth);
  }

  public areVoicesLoaded(): boolean {
    return this.voicesLoaded;
  }

  /**
   * Strictly checks if a genuine compatible native voice exists for the target language.
   * NEVER returns true for Telugu or Hindi if only English/default voices exist.
   */
  public supportsLanguage(lang: SupportedLanguage): boolean {
    if (!this.synth) return false;
    const voices = this.getNativeVoices();
    const targetCode = lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en';

    if (lang === 'en') {
      return voices.some((v) => v.lang.toLowerCase().startsWith('en')) || voices.length > 0;
    }

    return voices.some((v) => v.lang.toLowerCase().startsWith(targetCode));
  }

  public getNativeVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public getVoices(lang?: SupportedLanguage): SpeechVoiceInfo[] {
    const raw = this.getNativeVoices();
    const mapped: SpeechVoiceInfo[] = raw.map((v) => ({
      voiceId: v.voiceURI || v.name,
      name: v.name,
      lang: v.lang,
      locale: v.lang,
      isDefault: v.default,
      isLocalService: (v as any).localService ?? true,
      provider: 'browser'
    }));

    if (!lang) return mapped;
    const targetCode = lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en';
    return mapped.filter((v) => v.lang.toLowerCase().startsWith(targetCode));
  }

  /**
   * Finds the most authentic voice for the requested language.
   * Returns null if no authentic voice exists for Telugu or Hindi.
   */
  public findVoiceForLanguage(lang: SupportedLanguage): SpeechSynthesisVoice | null {
    const voices = this.getNativeVoices();
    const targetCode = lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en';

    if (lang === 'te') {
      // 1. Exact te-IN match
      const exact = voices.find((v) => v.lang.toLowerCase() === 'te-in');
      if (exact) return exact;
      // 2. Any Telugu voice
      const anyTe = voices.find((v) => v.lang.toLowerCase().startsWith('te'));
      if (anyTe) return anyTe;
      // Strictly do not fall back to an English voice for Telugu!
      return null;
    }

    if (lang === 'hi') {
      // 1. Exact hi-IN match
      const exact = voices.find((v) => v.lang.toLowerCase() === 'hi-in');
      if (exact) return exact;
      // 2. Any Hindi voice
      const anyHi = voices.find((v) => v.lang.toLowerCase().startsWith('hi'));
      if (anyHi) return anyHi;
      // Strictly do not fall back to an English voice for Hindi!
      return null;
    }

    // English:
    const enIn = voices.find((v) => v.lang.toLowerCase() === 'en-in');
    if (enIn) return enIn;
    const anyEn = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    if (anyEn) return anyEn;
    return voices.find((v) => v.default) || voices[0] || null;
  }

  /**
   * Chunks long scientific text at sentence and clause boundaries
   * avoiding truncated utterances in Chromium/WebKit.
   */
  public chunkText(text: string): SpeechChunk[] {
    const cleanText = text.trim();
    if (!cleanText) return [];

    // Split on sentence terminators (. ! ? । \n) while protecting common abbreviations
    const rawSentences = cleanText
      .replace(/\r\n/g, '\n')
      .split(/(?<=[.!?।\n])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const chunks: string[] = [];
    const MAX_CHUNK_LENGTH = 180;

    for (const sentence of rawSentences) {
      if (sentence.length <= MAX_CHUNK_LENGTH) {
        chunks.push(sentence);
      } else {
        // Sub-split overly long sentences at commas or semicolons
        const clauses = sentence.split(/(?<=[,;:—])\s+/);
        let current = '';

        for (const clause of clauses) {
          if ((current + ' ' + clause).trim().length <= MAX_CHUNK_LENGTH) {
            current = (current + ' ' + clause).trim();
          } else {
            if (current) chunks.push(current);
            if (clause.length > MAX_CHUNK_LENGTH) {
              // Forced break at word boundary
              const words = clause.split(/\s+/);
              let sub = '';
              for (const w of words) {
                if ((sub + ' ' + w).trim().length <= MAX_CHUNK_LENGTH) {
                  sub = (sub + ' ' + w).trim();
                } else {
                  if (sub) chunks.push(sub);
                  sub = w;
                }
              }
              if (sub) current = sub;
              else current = '';
            } else {
              current = clause;
            }
          }
        }
        if (current) chunks.push(current);
      }
    }

    return chunks.map((chunk, idx) => ({
      index: idx,
      total: chunks.length,
      text: chunk,
      spokenText: chunk
    }));
  }

  public async speak(options: SpeakOptions): Promise<void> {
    if (!this.synth) {
      options.onError?.('Web Speech API is not supported in this browser environment.');
      return;
    }

    // Cancel any active speech
    this.stop();

    const voice = this.findVoiceForLanguage(options.lang);
    if (!voice && options.lang !== 'en') {
      const langName = options.lang === 'te' ? 'Telugu (te-IN)' : 'Hindi (hi-IN)';
      const err = `Native browser voice for ${langName} is not available on this device.`;
      options.onError?.(err);
      throw new Error(err);
    }

    const chunks = this.chunkText(options.text);
    if (chunks.length === 0) {
      options.onEnd?.();
      return;
    }

    const token = ++this.activeToken;
    options.onStart?.();

    // Start keepalive heartbeat for Chromium 14-sec bug
    this.startKeepAlive();

    for (let i = 0; i < chunks.length; i++) {
      if (this.activeToken !== token) {
        // Playback was cancelled or replaced
        this.clearKeepAlive();
        return;
      }

      const chunk = chunks[i];
      options.onChunkChange?.(i + 1, chunks.length, chunk.text);

      await this.speakSingleChunk(chunk.text, options, voice, token);

      if (this.activeToken !== token) {
        this.clearKeepAlive();
        return;
      }
    }

    this.clearKeepAlive();
    if (this.activeToken === token) {
      options.onEnd?.();
    }
  }

  private speakSingleChunk(
    text: string,
    options: SpeakOptions,
    voice: SpeechSynthesisVoice | null,
    token: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth || this.activeToken !== token) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = options.lang === 'te' ? 'te-IN' : options.lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = options.playbackRate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        if (e.error === 'canceled' || e.error === 'interrupted') {
          resolve();
          return;
        }
        options.onError?.(`Speech synthesis error: ${e.error}`);
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  private startKeepAlive(): void {
    this.clearKeepAlive();
    // Periodically poke synthesis in Chromium
    this.keepAliveInterval = setInterval(() => {
      if (!this.synth || !this.synth.speaking) return;
      if (this.synth.paused) return;
      this.synth.pause();
      this.synth.resume();
    }, 9000);
  }

  private clearKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  public pause(): void {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop(): void {
    this.activeToken++;
    this.clearKeepAlive();
    this.currentUtterance = null;
    if (this.synth) {
      this.synth.cancel();
    }
  }
}
