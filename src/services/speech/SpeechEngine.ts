import { SupportedLanguage } from '../medicalTranslationEngine';
import { BrowserSpeechProvider } from './BrowserSpeechProvider';
import { CloudSpeechProvider } from './CloudSpeechProvider';
import {
  ISpeechProvider,
  SpeechEngineState,
  SpeechStateListener,
  SpeechSessionState
} from './types';

export class SpeechEngine {
  private browserProvider: BrowserSpeechProvider;
  private cloudProvider: CloudSpeechProvider;
  private listeners: Set<SpeechStateListener> = new Set();
  private lastSpokenText: string = '';
  private lastSectionName: string = 'Overview';

  private state: SpeechEngineState = {
    sessionState: 'idle',
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentLanguage: 'en',
    playbackRate: 1.0,
    currentSection: 'Overview',
    activeProvider: 'none',
    currentChunkIndex: 0,
    totalChunks: 0,
    currentChunkText: '',
    hasSpeechSynthesis: false,
    browserVoicesLoaded: false,
    availableVoices: {
      en: false,
      te: false,
      hi: false
    },
    voiceNames: {}
  };

  constructor() {
    this.browserProvider = new BrowserSpeechProvider();
    this.cloudProvider = new CloudSpeechProvider();

    this.state.hasSpeechSynthesis = this.browserProvider.isAvailable();
    this.updateVoiceAvailability();

    // Listen to voice loading changes
    this.browserProvider.onVoicesLoaded(() => {
      this.updateVoiceAvailability();
    });
  }

  public updateVoiceAvailability(): void {
    const enSupported = this.browserProvider.supportsLanguage('en');
    const teSupported = this.browserProvider.supportsLanguage('te');
    const hiSupported = this.browserProvider.supportsLanguage('hi');

    const teVoice = this.browserProvider.findVoiceForLanguage('te');
    const hiVoice = this.browserProvider.findVoiceForLanguage('hi');
    const enVoice = this.browserProvider.findVoiceForLanguage('en');

    this.state.browserVoicesLoaded = this.browserProvider.areVoicesLoaded();
    this.state.availableVoices = {
      en: enSupported,
      te: teSupported || this.cloudProvider.supportsLanguage('te'),
      hi: hiSupported || this.cloudProvider.supportsLanguage('hi')
    };

    this.state.voiceNames = {
      en: enVoice?.name || 'Default English Voice',
      te: teVoice?.name,
      hi: hiVoice?.name
    };

    this.broadcast();
  }

  public subscribe(listener: SpeechStateListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private broadcast(): void {
    this.listeners.forEach((fn) => {
      try {
        fn({ ...this.state });
      } catch {}
    });
  }

  /**
   * Determine best provider for the requested language.
   * Priority: Native Browser Voice -> Cloud TTS -> null
   */
  private resolveProvider(lang: SupportedLanguage): ISpeechProvider | null {
    if (this.browserProvider.supportsLanguage(lang)) {
      return this.browserProvider;
    }
    if (this.cloudProvider.supportsLanguage(lang)) {
      return this.cloudProvider;
    }
    return null;
  }

  /**
   * Called whenever user switches language in UI (e.g. English -> Telugu).
   * Immediately stops any active audio in old language and clears chunk states.
   */
  public handleLanguageChanged(newLang: SupportedLanguage): void {
    if (this.state.currentLanguage !== newLang) {
      if (this.state.isPlaying || this.state.isPaused) {
        this.stop();
      }
      this.state.currentLanguage = newLang;
      this.state.currentChunkIndex = 0;
      this.state.totalChunks = 0;
      this.state.currentChunkText = '';
      this.broadcast();
    }
  }

  /**
   * Initiates narration for text in the target language.
   * Enforces strict single-session exclusivity.
   */
  public async play(text: string, lang: SupportedLanguage, sectionName = 'Overview'): Promise<void> {
    if (!text.trim()) return;

    // Stop any current playback across all providers
    this.stop();

    this.lastSpokenText = text;
    this.lastSectionName = sectionName;
    this.state.currentLanguage = lang;
    this.state.currentSection = sectionName;
    this.state.errorMessage = undefined;

    const provider = this.resolveProvider(lang);

    if (!provider) {
      this.state.sessionState = 'unsupported';
      this.state.isPlaying = false;
      this.state.isPaused = false;
      const langName = lang === 'te' ? 'Telugu (తెలుగు)' : lang === 'hi' ? 'Hindi (हिंदी)' : 'English';
      this.state.errorMessage = `Voice synthesis for ${langName} is not available on this device's browser.`;
      this.broadcast();
      return;
    }

    this.state.activeProvider = provider.name;
    this.state.isLoading = true;
    this.state.sessionState = 'loading';
    this.broadcast();

    try {
      await provider.speak({
        text,
        lang,
        sectionName,
        playbackRate: this.state.playbackRate,
        onStart: () => {
          this.state.isLoading = false;
          this.state.isPlaying = true;
          this.state.isPaused = false;
          this.state.sessionState = 'playing';
          this.broadcast();
        },
        onChunkChange: (idx, total, chunkText) => {
          this.state.currentChunkIndex = idx;
          this.state.totalChunks = total;
          this.state.currentChunkText = chunkText;
          this.broadcast();
        },
        onEnd: () => {
          this.state.isPlaying = false;
          this.state.isPaused = false;
          this.state.sessionState = 'completed';
          this.state.currentChunkIndex = 0;
          this.state.totalChunks = 0;
          this.broadcast();
        },
        onError: (err) => {
          this.state.isPlaying = false;
          this.state.isPaused = false;
          this.state.sessionState = 'error';
          this.state.errorMessage = err;
          this.broadcast();
        }
      });
    } catch (err: any) {
      this.state.isLoading = false;
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.sessionState = 'error';
      this.state.errorMessage = err?.message || 'Speech playback failed.';
      this.broadcast();
    }
  }

  public pause(): void {
    if (this.state.isPlaying && !this.state.isPaused) {
      if (this.state.activeProvider === 'browser') {
        this.browserProvider.pause();
      } else if (this.state.activeProvider === 'cloud') {
        this.cloudProvider.pause();
      }
      this.state.isPaused = true;
      this.state.sessionState = 'paused';
      this.broadcast();
    }
  }

  public resume(): void {
    if (this.state.isPaused) {
      if (this.state.activeProvider === 'browser') {
        this.browserProvider.resume();
      } else if (this.state.activeProvider === 'cloud') {
        this.cloudProvider.resume();
      }
      this.state.isPaused = false;
      this.state.sessionState = 'playing';
      this.broadcast();
    }
  }

  public stop(): void {
    this.browserProvider.stop();
    this.cloudProvider.stop();

    const wasActive = this.state.isPlaying || this.state.isPaused;
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.isLoading = false;
    this.state.sessionState = wasActive ? 'cancelled' : 'idle';
    this.state.currentChunkIndex = 0;
    this.state.totalChunks = 0;
    this.state.currentChunkText = '';
    this.broadcast();
  }

  public replay(): void {
    if (this.lastSpokenText) {
      this.play(this.lastSpokenText, this.state.currentLanguage, this.lastSectionName);
    }
  }

  public setPlaybackRate(rate: number): void {
    this.state.playbackRate = rate;
    if (this.state.isPlaying && this.lastSpokenText) {
      this.play(this.lastSpokenText, this.state.currentLanguage, this.lastSectionName);
    } else {
      this.broadcast();
    }
  }

  public getState(): SpeechEngineState {
    return { ...this.state };
  }

  public getBrowserProvider(): BrowserSpeechProvider {
    return this.browserProvider;
  }

  public getCloudProvider(): CloudSpeechProvider {
    return this.cloudProvider;
  }
}

export const speechEngine = new SpeechEngine();
