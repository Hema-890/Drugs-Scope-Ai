import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Radio
} from 'lucide-react';
import { SupportedLanguage, optimizeTextForSpeechNarration } from '../../services/medicalTranslationEngine';
import { useReportSpeech } from '../../hooks/useReportSpeech';

export type AudioReportSection = 'all' | 'overview' | 'interactions' | 'risks' | 'warnings';

interface ReportAudioPlayerProps {
  currentLang: SupportedLanguage;
  selectedSection: AudioReportSection;
  onSectionChange: (section: AudioReportSection) => void;
  onGenerateText: (section: AudioReportSection) => string;
}

export const ReportAudioPlayer: React.FC<ReportAudioPlayerProps> = ({
  currentLang,
  selectedSection,
  onSectionChange,
  onGenerateText
}) => {
  const {
    speechState,
    isPlaying,
    isPaused,
    isLoading,
    currentChunkIndex,
    totalChunks,
    playbackRate,
    isCurrentVoiceAvailable,
    errorMessage,
    play,
    pause,
    resume,
    stop,
    replay,
    setPlaybackRate
  } = useReportSpeech(currentLang);

  const [showVoiceHelp, setShowVoiceHelp] = useState(false);

  const handleTogglePlayback = () => {
    if (isPlaying) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      const rawText = onGenerateText(selectedSection);
      if (!rawText.trim()) return;
      const spokenText = optimizeTextForSpeechNarration(rawText, currentLang);
      play(spokenText, selectedSection);
    }
  };

  const sectionLabels: Record<AudioReportSection, { en: string; te: string; hi: string }> = {
    all: { en: 'Entire Report', te: 'మొత్తం నివేదిక', hi: 'संपूर्ण रिपोर्ट' },
    overview: { en: 'Overview & Indications', te: 'అవలోకనం & ఉపయోగాలు', hi: 'अवलोकन एवं संकेत' },
    interactions: { en: 'Interactions & Mechanisms', te: 'పరస్పర చర్యలు & విధానం', hi: 'परस्पर क्रियाएं एवं तंत्र' },
    risks: { en: 'Adverse Effects & Risks', te: 'దుష్ప్రభావాలు & ప్రమాదాలు', hi: 'प्रतिकूल प्रभाव एवं जोखिम' },
    warnings: { en: 'Boxed Warnings', te: 'బాక్స్‌డ్ తీవ్ర హెచ్చరికలు', hi: 'बॉक्स चेतावनियां' }
  };

  const languageLabels: Record<SupportedLanguage, { name: string; native: string; voiceHint: string }> = {
    en: { name: 'English', native: 'English', voiceHint: 'Indian/International English Voice' },
    te: { name: 'Telugu', native: 'తెలుగు', voiceHint: 'Native Telugu (te-IN) Engine' },
    hi: { name: 'Hindi', native: 'हिंदी', voiceHint: 'Native Hindi (hi-IN) Engine' }
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#0B1120]/95 shadow-xl flex flex-col gap-3 transition-all">
      {/* Top Row: Title, Language Indicator, Voice Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border transition-all ${
              isPlaying && !isPaused
                ? 'bg-[#37D6E6]/20 border-[#37D6E6] text-[#37D6E6] shadow-[0_0_15px_rgba(55,214,230,0.3)] animate-pulse'
                : isPaused
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-white/5 border-white/10 text-[#A7B5C9]'
            }`}
          >
            {isPlaying && !isPaused ? (
              <Volume2 className="w-4 h-4 text-[#37D6E6]" />
            ) : isPaused ? (
              <Pause className="w-4 h-4 text-amber-300" />
            ) : isCurrentVoiceAvailable ? (
              <Volume2 className="w-4 h-4 text-[#A7B5C9]" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </div>

          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>
                {currentLang === 'te'
                  ? 'వైద్య నివేదిక వాయిస్ కథనం'
                  : currentLang === 'hi'
                  ? 'नैदानिक रिपोर्ट ऑडियो कथन'
                  : 'Clinical Report Speech Narration'}
              </span>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#37D6E6]/10 text-[#37D6E6] border border-[#37D6E6]/30">
                {languageLabels[currentLang].native} [{currentLang.toUpperCase()}-IN]
              </span>
            </div>

            <div className="text-[11px] text-[#A7B5C9] flex items-center gap-1.5 mt-0.5">
              {isPlaying && !isPaused ? (
                <span className="text-[#37D6E6] flex items-center gap-1 font-mono text-[10px]">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>
                    Narrating segment {currentChunkIndex} of {totalChunks || 1} ({playbackRate}x)
                  </span>
                </span>
              ) : isPaused ? (
                <span className="text-amber-300 font-mono text-[10px]">Playback Paused</span>
              ) : isCurrentVoiceAvailable ? (
                <span>Click Play to synthesize evidence report in {languageLabels[currentLang].native}.</span>
              ) : (
                <span className="text-amber-400/90 flex items-center gap-1 text-[10px]">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span>Native voice for {languageLabels[currentLang].native} is not installed on this OS.</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Voice Availability Pill */}
        <div className="flex items-center gap-2">
          {isCurrentVoiceAvailable ? (
            <div
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5"
              title={speechState.voiceNames[currentLang] || 'Compatible voice available'}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Voice Ready: {speechState.voiceNames[currentLang] ? speechState.voiceNames[currentLang]?.slice(0, 18) + '...' : 'Native Voice'}</span>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowVoiceHelp(!showVoiceHelp)}
                className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <AlertCircle className="w-3 h-3" />
                <span>Voice Unavailable on OS</span>
                <HelpCircle className="w-3 h-3 text-amber-400/80" />
              </button>

              {showVoiceHelp && (
                <div className="absolute right-0 top-8 z-30 w-72 p-3 rounded-xl bg-[#070B14] border border-amber-500/40 text-[11px] text-[#A7B5C9] shadow-2xl space-y-1.5">
                  <div className="font-bold text-amber-300">Why is this voice unavailable?</div>
                  <p className="leading-relaxed">
                    Your current browser and operating system do not have a preinstalled <strong>{languageLabels[currentLang].name}</strong> speech voice.
                  </p>
                  <p className="leading-relaxed text-[10px] text-white/70">
                    To enable native speech, install the <em>Indian English / Hindi / Telugu</em> speech pack in your OS Accessibility/Speech settings, or configure Cloud TTS on the backend.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Section Filter, Controls, Speed Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
        {/* Section Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="audio-section-select" className="text-[11px] font-mono text-[#A7B5C9] shrink-0">
            Section:
          </label>
          <select
            id="audio-section-select"
            value={selectedSection}
            onChange={(e) => {
              if (isPlaying) stop();
              onSectionChange(e.target.value as AudioReportSection);
            }}
            className="bg-[#101827] border border-white/15 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#37D6E6] cursor-pointer"
          >
            <option value="all">{sectionLabels.all[currentLang]}</option>
            <option value="overview">{sectionLabels.overview[currentLang]}</option>
            <option value="interactions">{sectionLabels.interactions[currentLang]}</option>
            <option value="risks">{sectionLabels.risks[currentLang]}</option>
            <option value="warnings">{sectionLabels.warnings[currentLang]}</option>
          </select>
        </div>

        {/* Control Buttons: Play/Pause, Stop, Replay, Speed */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Play / Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlayback}
            disabled={isLoading}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              !isCurrentVoiceAvailable
                ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10'
                : isPlaying && !isPaused
                ? 'bg-amber-400 hover:bg-amber-300 text-[#070B14]'
                : 'bg-gradient-to-r from-[#24D8ED] to-[#9475FF] hover:opacity-95 text-[#070B14]'
            }`}
            title={!isCurrentVoiceAvailable ? 'Native voice is not installed on this browser' : undefined}
          >
            {isLoading ? (
              <span>Loading...</span>
            ) : isPlaying && !isPaused ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Stop Button */}
          <button
            type="button"
            onClick={stop}
            disabled={!isPlaying && !isPaused}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Stop Speech"
          >
            <span className="w-3 h-3 bg-white block rounded-sm" />
          </button>

          {/* Replay Button */}
          <button
            type="button"
            onClick={replay}
            disabled={!isCurrentVoiceAvailable}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Replay from Beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Playback Rate Selector */}
          <div className="flex items-center bg-[#101827] border border-white/15 rounded-xl p-0.5 text-[11px] font-mono">
            {[0.75, 1.0, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setPlaybackRate(speed)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  playbackRate === speed
                    ? 'bg-[#37D6E6] text-[#070B14] font-bold shadow-sm'
                    : 'text-[#A7B5C9] hover:text-white'
                }`}
                title={`Set speed to ${speed}x`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Notice Banner if any */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
