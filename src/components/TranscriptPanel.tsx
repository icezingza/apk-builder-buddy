import { useEffect, useRef } from 'react';
import { User, Bot, MessageSquare } from 'lucide-react';
import type { TranscriptEntry } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptPanelProps {
  transcripts: TranscriptEntry[];
}

export function TranscriptPanel({ transcripts }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 bg-slate-800 border-b border-slate-700">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Live Transcript</h2>
        <span className="ml-auto text-xs text-slate-500">
          {transcripts.length} message{transcripts.length !== 1 ? 's' : ''}
        </span>
      </div>

      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
        {transcripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1 opacity-60">Conversation will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transcripts.map((entry) => (
              <div
                key={entry.id}
                className={`
                  flex gap-3 p-4 rounded-xl
                  ${entry.speaker === 'user' 
                    ? 'bg-blue-500/10 border border-blue-500/20 ml-8' 
                    : 'bg-purple-500/10 border border-purple-500/20 mr-8'
                  }
                `}
              >
                <div
                  className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    ${entry.speaker === 'user'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                    }
                  `}
                >
                  {entry.speaker === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {entry.speaker === 'user' ? 'You' : 'Namo AI'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed break-words">
                    {entry.text}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
