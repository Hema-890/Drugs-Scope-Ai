import { SupportedLanguage } from '../medicalTranslationEngine';

export type SpeechSessionState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'error'
  | 'unsupported';

export interface SpeechVoiceInfo {
  voiceId: string;
  name: string;
  lang: string;
  locale: string;
  isDefault: boolean;
  isLocalService: boolean;
  provider: 'browser' | 'cloud';
}

export interface SpeakOptions {
  text: string;
  lang: SupportedLanguage;
  sectionName?: string;
  playbackRate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onChunkChange?: (chunkIndex: number, totalChunks: number, chunkText: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onPause?: () => void;
  onResume?: () => void;
}

export interface SpeechChunk {
  index: number;
  total: number;
  text: string;
  spokenText: string;
}

export interface SpeechEngineState {
  sessionState: SpeechSessionState;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentLanguage: SupportedLanguage;
  playbackRate: number;
  currentSection: string;
  activeProvider: 'browser' | 'cloud' | 'none';
  currentChunkIndex: number;
  totalChunks: number;
  currentChunkText: string;
  hasSpeechSynthesis: boolean;
  browserVoicesLoaded: boolean;
  availableVoices: {
    en: boolean;
    te: boolean;
    hi: boolean;
  };
  voiceNames: {
    en?: string;
    te?: string;
    hi?: string;
  };
  errorMessage?: string;
}

export type SpeechStateListener = (state: SpeechEngineState) => void;

export interface ISpeechProvider {
  name: 'browser' | 'cloud';
  isAvailable(): boolean;
  supportsLanguage(lang: SupportedLanguage): boolean;
  getVoices(lang?: SupportedLanguage): SpeechVoiceInfo[];
  speak(options: SpeakOptions): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
}
