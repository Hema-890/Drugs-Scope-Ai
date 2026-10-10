import { SupportedLanguage } from './medicalTranslationEngine';

export interface AudioPlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentLanguage: SupportedLanguage;
  playbackRate: number;
  currentSection: string;
  hasSpeechSynthesis: boolean;
  availableVoices: {
    en: boolean;
    te: boolean;
    hi: boolean;
  };
  errorMessage?: string;
}

export type AudioStateListener = (state: AudioPlaybackState) => void;

class AudioVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<AudioStateListener> = new Set();
  private state: AudioPlaybackState = {
    isPlaying: false,
    isPaused: false,
    currentLanguage: 'en',
    playbackRate: 1.0,
    currentSection: 'Overview',
    hasSpeechSynthesis: false,
    availableVoices: {
      en: true,
      te: false,
      hi: false
    }
  };
  private lastSpokenText: string = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.state.hasSpeechSynthesis = true;
      this.initVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    this.state.availableVoices = {
      en: voices.some((v) => v.lang.startsWith('en')),
      te: voices.some((v) => v.lang.startsWith('te')),
      hi: voices.some((v) => v.lang.startsWith('hi'))
    };
    this.broadcast();
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private broadcast() {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.state });
      } catch {
        // safe listener failure
      }
    });
  }

  private findVoiceForLanguage(lang: SupportedLanguage): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();

    const targetLangCode = lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en';

    // 1. Exact match e.g. 'te-IN', 'hi-IN', 'en-IN'
    const exact = voices.find((v) => v.lang.toLowerCase() === `${targetLangCode}-in`);
    if (exact) return exact;

    // 2. Prefix match e.g. 'te', 'hi', 'en'
    const prefix = voices.find((v) => v.lang.toLowerCase().startsWith(targetLangCode));
    if (prefix) return prefix;

    // 3. Fallback default voice
    return voices.find((v) => v.default) || voices[0] || null;
  }

  /**
   * Speak clinical report text in the selected language
   */
  public play(text: string, lang: SupportedLanguage, sectionName = 'Overview'): void {
    if (!this.synth || !text.trim()) return;

    // Cancel any previous speech immediately
    this.stop();

    this.lastSpokenText = text;
    this.state.currentLanguage = lang;
    this.state.currentSection = sectionName;
    this.state.errorMessage = undefined;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const voice = this.findVoiceForLanguage(lang);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = this.state.playbackRate;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.broadcast();
      };

      utterance.onend = () => {
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.currentUtterance = null;
        this.broadcast();
      };

      utterance.onerror = (event) => {
        // Ignore canceled errors from calling stop()
        if (event.error === 'canceled' || event.error === 'interrupted') return;
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.errorMessage = `Audio playback error: ${event.error}`;
        this.currentUtterance = null;
        this.broadcast();
      };

      utterance.onpause = () => {
        this.state.isPaused = true;
        this.broadcast();
      };

      utterance.onresume = () => {
        this.state.isPaused = false;
        this.broadcast();
      };

      this.synth.speak(utterance);
    } catch (e: any) {
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.errorMessage = e?.message || 'Failed to initialize audio voice synthesizer.';
      this.broadcast();
    }
  }

  public pause(): void {
    if (this.synth && this.state.isPlaying && !this.state.isPaused) {
      this.synth.pause();
      this.state.isPaused = true;
      this.broadcast();
    }
  }

  public resume(): void {
    if (this.synth && this.state.isPaused) {
      this.synth.resume();
      this.state.isPaused = false;
      this.broadcast();
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.currentUtterance = null;
      this.broadcast();
    }
  }

  public replay(): void {
    if (this.lastSpokenText) {
      this.play(this.lastSpokenText, this.state.currentLanguage, this.state.currentSection);
    }
  }

  public setPlaybackRate(rate: number): void {
    this.state.playbackRate = rate;
    if (this.state.isPlaying && this.lastSpokenText) {
      // Re-trigger with new rate seamlessly
      this.play(this.lastSpokenText, this.state.currentLanguage, this.state.currentSection);
    } else {
      this.broadcast();
    }
  }

  public getState(): AudioPlaybackState {
    return { ...this.state };
  }
}

export const audioVoiceEngine = new AudioVoiceEngine();
