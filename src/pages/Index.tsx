import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { AIStatusIndicator } from '@/components/AIStatusIndicator';
import { TranscriptPanel } from '@/components/TranscriptPanel';
import { ControlBar } from '@/components/ControlBar';
import { SettingsModal } from '@/components/SettingsModal';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { ServerSettings, LanguageMode } from '@/types';
import { Toaster, toast } from 'sonner';

const DEFAULT_SETTINGS: ServerSettings = {
  serverIp: '192.168.1.100',
  port: '8080',
};

const Index = () => {
  const [settings, setSettings] = useState<ServerSettings>(() => {
    const saved = localStorage.getItem('namo-ai-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    isConnected,
    connectionState,
    aiState,
    transcripts,
    hardwareStatus,
    isMuted,
    currentLanguage,
    wakeAI,
    stopAI,
    setLanguage,
    toggleMute,
    clearContext,
    reconnectAttempts,
    clearTranscripts,
  } = useWebSocket({
    serverIp: settings.serverIp,
    port: settings.port,
    onConnect: () => {
      toast.success('Connected to Namo AI server', {
        description: `Connected to ws://${settings.serverIp}:${settings.port}`,
      });
    },
    onDisconnect: () => {
      toast.error('Disconnected from server', {
        description: 'Attempting to reconnect...',
      });
    },
    onError: () => {
      toast.error('Connection error', {
        description: 'Check your server settings',
      });
    },
  });

  const handleSaveSettings = useCallback((newSettings: ServerSettings) => {
    setSettings(newSettings);
    localStorage.setItem('namo-ai-settings', JSON.stringify(newSettings));
    toast.info('Settings saved', {
      description: 'Reconnecting with new settings...',
    });
  }, []);

  const handleWake = useCallback(() => {
    if (wakeAI()) {
      toast.info('Wake signal sent');
    } else {
      toast.error('Failed to send wake signal', {
        description: 'Not connected to server',
      });
    }
  }, [wakeAI]);

  const handleStop = useCallback(() => {
    if (stopAI()) {
      toast.info('Stop signal sent');
    } else {
      toast.error('Failed to send stop signal', {
        description: 'Not connected to server',
      });
    }
  }, [stopAI]);

  const handleLanguageChange = useCallback((mode: LanguageMode) => {
    if (setLanguage(mode)) {
      toast.success('Language changed', {
        description: `Switched to ${mode}`,
      });
    } else {
      toast.error('Failed to change language', {
        description: 'Not connected to server',
      });
    }
  }, [setLanguage]);

  const handleToggleMute = useCallback(() => {
    if (toggleMute()) {
      toast.info(isMuted ? 'Microphone unmuted' : 'Microphone muted');
    } else {
      toast.error('Failed to toggle mute', {
        description: 'Not connected to server',
      });
    }
  }, [toggleMute, isMuted]);

  const handleClearChat = useCallback(() => {
    if (clearContext()) {
      clearTranscripts();
      toast.info('Chat cleared', {
        description: 'Context reset sent to server',
      });
    } else {
      toast.error('Failed to clear chat', {
        description: 'Not connected to server',
      });
    }
  }, [clearContext, clearTranscripts]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden">
      <Toaster 
        position="top-right" 
        theme="dark"
        toastOptions={{
          style: {
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#fff',
          },
        }}
      />

      <Header
        connectionState={connectionState}
        reconnectAttempts={reconnectAttempts}
        hardwareStatus={hardwareStatus}
        currentLanguage={currentLanguage}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onLanguageChange={handleLanguageChange}
      />

      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-shrink-0">
          <AIStatusIndicator state={aiState} isMuted={isMuted} />
        </div>

        <div className="flex-1 min-h-0 px-6 pb-4">
          <TranscriptPanel transcripts={transcripts} />
        </div>
      </main>

      <ControlBar
        aiState={aiState}
        isConnected={isConnected}
        isMuted={isMuted}
        onWake={handleWake}
        onStop={handleStop}
        onToggleMute={handleToggleMute}
        onClearChat={handleClearChat}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default Index;
