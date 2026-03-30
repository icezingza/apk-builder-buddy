import { Mic, Square, MicOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AIState } from '@/types';

interface ControlBarProps {
  aiState: AIState;
  isConnected: boolean;
  isMuted: boolean;
  onWake: () => void;
  onStop: () => void;
  onToggleMute: () => void;
  onClearChat: () => void;
}

export function ControlBar({ 
  aiState, 
  isConnected, 
  isMuted,
  onWake, 
  onStop, 
  onToggleMute,
  onClearChat,
}: ControlBarProps) {
  const isListening = aiState === 'listening';
  const isSpeaking = aiState === 'speaking';
  const isThinking = aiState === 'thinking';
  const isBusy = isSpeaking || isThinking;

  return (
    <div className="flex items-center justify-center gap-6 py-5 px-8 bg-slate-900 border-t border-slate-700">
      {/* Mute Mic Toggle Button */}
      <Button
        onClick={onToggleMute}
        disabled={!isConnected}
        variant="outline"
        className={`
          h-20 px-6 rounded-xl font-semibold text-base
          transition-all duration-200 transform active:scale-95
          ${isMuted 
            ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500' 
            : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
          }
          disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
        `}
      >
        <span className="flex items-center gap-3">
          {isMuted ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
          <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
        </span>
      </Button>

      {/* Push to Wake Button */}
      <Button
        onClick={onWake}
        disabled={!isConnected || isListening || isMuted}
        className={`
          relative h-24 px-12 rounded-2xl font-bold text-xl
          transition-all duration-200 transform active:scale-95
          ${isListening
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40'
          }
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        `}
      >
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-2xl bg-blue-400 animate-ping opacity-20" />
            <span className="absolute -inset-2 rounded-3xl bg-blue-400 animate-ping opacity-10" style={{ animationDelay: '0.2s' }} />
          </>
        )}
        
        <span className="relative flex items-center gap-4">
          <Mic className={`w-8 h-8 ${isListening ? 'animate-pulse' : ''}`} />
          <span>
            {isListening ? 'Listening...' : 'Push to Wake'}
          </span>
        </span>
      </Button>

      {/* Interrupt / Stop Button */}
      <Button
        onClick={onStop}
        disabled={!isConnected || !isBusy}
        variant="destructive"
        className={`
          h-24 px-10 rounded-2xl font-bold text-xl
          transition-all duration-200 transform active:scale-95
          bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500
          text-white shadow-xl shadow-red-500/25 hover:shadow-red-500/40
          disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
        `}
      >
        <span className="flex items-center gap-4">
          <Square className="w-8 h-8 fill-current" />
          <span>Stop</span>
        </span>
      </Button>

      {/* Clear Chat Button */}
      <Button
        onClick={onClearChat}
        disabled={!isConnected}
        variant="outline"
        className="
          h-20 px-6 rounded-xl font-semibold text-base
          transition-all duration-200 transform active:scale-95
          bg-slate-800 border-slate-600 text-slate-300 
          hover:bg-slate-700 hover:border-slate-500 hover:text-red-400
          disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
        "
      >
        <span className="flex items-center gap-3">
          <Trash2 className="w-6 h-6" />
          <span>Clear Chat</span>
        </span>
      </Button>
    </div>
  );
}
