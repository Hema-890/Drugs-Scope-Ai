import { useEffect, useState, useCallback, useRef } from 'react';
import { SupportedLanguage } from '../services/medicalTranslationEngine';
import { speechEngine } from '../services/speech/SpeechEngine';
import { SpeechEngineState } from '../services/speech/types';

export function useReportSpeech(currentLang: SupportedLanguage) {
  const [speechState, setSpeechState] = useState<SpeechEngineState>(speechEngine.getState());
  const prevLangRef = useRef<SupportedLanguage>(currentLang);

  // Subscribe to speech engine updates
  useEffect(() => {
    const unsubscribe = speechEngine.subscribe((newState) => {
      setSpeechState(newState);
    });

    return () => {
      speechEngine.stop();
      unsubscribe();
    };
  }, []);

  // Language synchronization: Stop playback and reset queue if language switches
  useEffect(() => {
    if (prevLangRef.current !== currentLang) {
      speechEngine.handleLanguageChanged(currentLang);
      prevLangRef.current = currentLang;
    }
  }, [currentLang]);

  const play = useCallback(
    (text: string, sectionName = 'Overview') => {
      speechEngine.play(text, currentLang, sectionName);
    },
    [currentLang]
  );

  const pause = useCallback(() => {
    speechEngine.pause();
  }, []);

  const resume = useCallback(() => {
    speechEngine.resume();
  }, []);

  const stop = useCallback(() => {
    speechEngine.stop();
  }, []);

  const replay = useCallback(() => {
    speechEngine.replay();
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    speechEngine.setPlaybackRate(rate);
  }, []);

  const isCurrentVoiceAvailable = Boolean(speechState.availableVoices[currentLang]);

  return {
    speechState,
    isPlaying: speechState.isPlaying,
    isPaused: speechState.isPaused,
    isLoading: speechState.isLoading,
    sessionState: speechState.sessionState,
    currentChunkIndex: speechState.currentChunkIndex,
    totalChunks: speechState.totalChunks,
    currentChunkText: speechState.currentChunkText,
    playbackRate: speechState.playbackRate,
    isCurrentVoiceAvailable,
    errorMessage: speechState.errorMessage,
    play,
    pause,
    resume,
    stop,
    replay,
    setPlaybackRate
  };
}
