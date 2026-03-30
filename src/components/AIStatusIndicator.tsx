import { Mic, Brain, Volume2, Circle, MicOff } from 'lucide-react';
import type { AIState } from '@/types';

interface AIStatusIndicatorProps {
  state: AIState;
  isMuted?: boolean;
}

export function AIStatusIndicator({ state, isMuted = false }: AIStatusIndicatorProps) {
  const getStatusConfig = () => {
    if (isMuted) {
      return {
        icon: MicOff,
        text: 'Microphone Muted',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/50',
        animation: '',
        waves: false,
      };
    }

    switch (state) {
      case 'listening':
        return {
          icon: Mic,
          text: 'Listening...',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/50',
          animation: 'animate-pulse',
          waves: true,
        };
      case 'thinking':
        return {
          icon: Brain,
          text: 'Thinking...',
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/20',
          borderColor: 'border-amber-500/50',
          animation: 'animate-spin',
          waves: false,
        };
      case 'speaking':
        return {
          icon: Volume2,
          text: 'Speaking...',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/50',
          animation: 'animate-bounce',
          waves: true,
        };
      case 'idle':
      default:
        return {
          icon: Circle,
          text: 'Idle',
          color: 'text-slate-400',
          bgColor: 'bg-slate-700/30',
          borderColor: 'border-slate-600/50',
          animation: '',
          waves: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-5">
      <div
        className={`
          relative flex items-center justify-center
          w-20 h-20 rounded-full
          ${config.bgColor} ${config.borderColor}
          border-2 transition-all duration-300
        `}
      >
        {config.waves && (
          <>
            <span className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping" style={{ animationDuration: '1.5s' }} />
            <span className="absolute -inset-4 rounded-full bg-current opacity-10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
            <span className="absolute -inset-8 rounded-full bg-current opacity-5 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.6s' }} />
          </>
        )}
        
        <Icon className={`w-9 h-9 ${config.color} ${config.animation}`} />
      </div>
      
      <div className="mt-3 text-center">
        <p className={`text-lg font-semibold ${config.color}`}>
          {config.text}
        </p>
        <p className="text-sm text-slate-500 mt-0.5">
          {isMuted 
            ? 'Press Unmute Mic to resume'
            : state === 'idle' 
              ? 'Ready for your command' 
              : state === 'listening' 
                ? 'Speak now' 
                : state === 'thinking' 
                  ? 'Processing your request' 
                  : 'Playing response'
          }
        </p>
      </div>
    </div>
  );
}
