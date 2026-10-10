import { SupportedLanguage } from '../medicalTranslationEngine';
import { ISpeechProvider, SpeakOptions, SpeechVoiceInfo } from './types';

export class CloudSpeechProvider implements ISpeechProvider {
  public readonly name = 'cloud' as const;
  private isConfiguredOnServer: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private activeToken: number = 0;
  private checkPromise: Promise<boolean> | null = null;

  constructor() {
    this.checkConfiguredStatus();
  }

  public async checkConfiguredStatus(): Promise<boolean> {
    if (this.checkPromise) return this.checkPromise;
    if (typeof window === 'undefined') {
      this.isConfiguredOnServer = false;
      return false;
    }

    this.checkPromise = (async () => {
      try {
        const res = await fetch('/api/speech?action=status');
        if (res.ok) {
          const data = await res.json();
          this.isConfiguredOnServer = Boolean(data.configured);
          return this.isConfiguredOnServer;
        }
      } catch {
        this.isConfiguredOnServer = false;
      }
      return false;
    })();

    return this.checkPromise;
  }

  public isAvailable(): boolean {
    return this.isConfiguredOnServer;
  }

  public supportsLanguage(lang: SupportedLanguage): boolean {
    // When cloud TTS is configured on server, it supports all 3 languages (en, te, hi)
    return this.isConfiguredOnServer && ['en', 'te', 'hi'].includes(lang);
  }

  public getVoices(lang?: SupportedLanguage): SpeechVoiceInfo[] {
    if (!this.isConfiguredOnServer) return [];

    const cloudVoices: SpeechVoiceInfo[] = [
      {
        voiceId: 'cloud-en-in-standard',
        name: 'Cloud Studio English (India)',
        lang: 'en-IN',
        locale: 'en-IN',
        isDefault: true,
        isLocalService: false,
        provider: 'cloud'
      },
      {
        voiceId: 'cloud-te-in-standard',
        name: 'Cloud Studio Telugu (India)',
        lang: 'te-IN',
        locale: 'te-IN',
        isDefault: true,
        isLocalService: false,
        provider: 'cloud'
      },
      {
        voiceId: 'cloud-hi-in-standard',
        name: 'Cloud Studio Hindi (India)',
        lang: 'hi-IN',
        locale: 'hi-IN',
        isDefault: true,
        isLocalService: false,
        provider: 'cloud'
      }
    ];

    if (!lang) return cloudVoices;
    const target = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    return cloudVoices.filter((v) => v.lang === target);
  }

  public async speak(options: SpeakOptions): Promise<void> {
    const isReady = await this.checkConfiguredStatus();
    if (!isReady) {
      const err = 'Cloud Text-to-Speech fallback is not configured on the backend server.';
      options.onError?.(err);
      throw new Error(err);
    }

    this.stop();
    const token = ++this.activeToken;
    options.onStart?.();

    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: options.text,
          lang: options.lang,
          rate: options.playbackRate ?? 1.0
        })
      });

      if (!response.ok) {
        throw new Error(`Cloud speech synthesis HTTP ${response.status}`);
      }

      const audioBlob = await response.blob();
      if (this.activeToken !== token) return;

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      audio.playbackRate = options.playbackRate ?? 1.0;

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          resolve();
        };

        audio.onerror = (e) => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          reject(new Error('Cloud audio playback error'));
        };

        audio.play().catch(reject);
      });

      if (this.activeToken === token) {
        options.onEnd?.();
      }
    } catch (err: any) {
      if (this.activeToken === token) {
        options.onError?.(err?.message || 'Failed to synthesize cloud audio');
      }
    }
  }

  public pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  public resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(() => {});
    }
  }

  public stop(): void {
    this.activeToken++;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
}
