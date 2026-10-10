import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (moduleId: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('Click microphone and speak a command (e.g., "Open 3D Lab", "Check Warfarin", "Report Studio").');

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
    }
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setFeedback('Speech Recognition is not natively supported in this browser. Please type via ⌘K.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback('Listening... Speak now.');
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);

        // Analyze command
        const lower = text.toLowerCase();
        if (lower.includes('3d') || lower.includes('molecular') || lower.includes('lab') || lower.includes('structure')) {
          setFeedback('Recognized command: Opening 3D Molecular Lab...');
          setTimeout(() => {
            onNavigate('molecular-lab');
            onClose();
          }, 900);
        } else if (lower.includes('interaction') || lower.includes('conflict')) {
          setFeedback('Recognized command: Navigating to Interaction Review...');
          setTimeout(() => {
            onNavigate('interaction-review');
            onClose();
          }, 900);
        } else if (lower.includes('report') || lower.includes('studio') || lower.includes('pdf')) {
          setFeedback('Recognized command: Opening Report Studio...');
          setTimeout(() => {
            onNavigate('report-studio');
            onClose();
          }, 900);
        } else if (lower.includes('clinical') || lower.includes('patient')) {
          setFeedback('Recognized command: Opening Clinical Review...');
          setTimeout(() => {
            onNavigate('clinical-workspace');
            onClose();
          }, 900);
        } else if (lower.includes('medicine') || lower.includes('drug') || lower.includes('warfarin') || lower.includes('explorer')) {
          setFeedback('Recognized command: Opening Medicine Explorer...');
          setTimeout(() => {
            onNavigate('medicine-explorer');
            onClose();
          }, 900);
        }
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        setFeedback(`Microphone notice: ${e.error || 'Speech ended'}. Please try again.`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setFeedback('Microphone permission denied or unavailable.');
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#101827] border border-[#37D6E6]/30 rounded-2xl p-6 text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A7B5C9] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto w-16 h-16 rounded-full bg-[#37D6E6]/10 border border-[#37D6E6]/40 flex items-center justify-center mb-4">
          <Volume2 className="w-8 h-8 text-[#37D6E6] animate-pulse" />
        </div>

        <h3 className="font-display font-bold text-lg text-white">Voice-Assisted Research Navigation</h3>
        <p className="text-xs text-[#A7B5C9] mt-1">
          Hands-free scientific queries using client-side Web Speech recognition
        </p>

        <div className="my-6 p-4 rounded-xl bg-[#070B14] border border-white/10 min-h-[90px] flex flex-col justify-center items-center">
          {transcript ? (
            <div className="font-mono text-sm text-[#37D6E6]">"{transcript}"</div>
          ) : (
            <div className="text-xs text-[#64748B] italic">Waiting for speech input...</div>
          )}
          <div className="text-xs text-[#32C8B7] mt-2 font-medium">{feedback}</div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={startListening}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              isListening
                ? 'bg-[#F16D76] text-white shadow-lg animate-pulse'
                : 'bg-[#37D6E6] text-[#070B14] hover:bg-[#37D6E6]/90'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening ? 'Listening...' : 'Start Voice Input'}
          </button>
        </div>

        <div className="mt-4 text-[10px] text-[#64748B] font-mono">
          Security: Audio processed in browser session only. No continuous audio streaming.
        </div>
      </div>
    </div>
  );
};
