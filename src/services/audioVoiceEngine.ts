import { SupportedLanguage } from './medicalTranslationEngine';
import { speechEngine, SpeechEngine } from './speech/SpeechEngine';
import { SpeechEngineState } from './speech/types';

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
  voiceNames?: {
    en?: string;
    te?: string;
    hi?: string;
  };
  errorMessage?: string;
  currentChunkIndex?: number;
  totalChunks?: number;
  sessionState?: string;
}

export type AudioStateListener = (state: AudioPlaybackState) => void;

class AudioVoiceEngineAdapter {
  private engine: SpeechEngine;

  constructor() {
    this.engine = speechEngine;
  }

  public subscribe(listener: AudioStateListener): () => void {
    return this.engine.subscribe((s: SpeechEngineState) => {
      listener(this.mapState(s));
    });
  }

  private mapState(s: SpeechEngineState): AudioPlaybackState {
    return {
      isPlaying: s.isPlaying,
      isPaused: s.isPaused,
      currentLanguage: s.currentLanguage,
      playbackRate: s.playbackRate,
      currentSection: s.currentSection,
      hasSpeechSynthesis: s.hasSpeechSynthesis,
      availableVoices: s.availableVoices,
      voiceNames: s.voiceNames,
      errorMessage: s.errorMessage,
      currentChunkIndex: s.currentChunkIndex,
      totalChunks: s.totalChunks,
      sessionState: s.sessionState
    };
  }

  public play(text: string, lang: SupportedLanguage, sectionName = 'Overview'): void {
    this.engine.play(text, lang, sectionName);
  }

  public pause(): void {
    this.engine.pause();
  }

  public resume(): void {
    this.engine.resume();
  }

  public stop(): void {
    this.engine.stop();
  }

  public replay(): void {
    this.engine.replay();
  }

  public setPlaybackRate(rate: number): void {
    this.engine.setPlaybackRate(rate);
  }

  public getState(): AudioPlaybackState {
    return this.mapState(this.engine.getState());
  }

  public handleLanguageChanged(lang: SupportedLanguage): void {
    this.engine.handleLanguageChanged(lang);
  }
}

export const audioVoiceEngine = new AudioVoiceEngineAdapter();
