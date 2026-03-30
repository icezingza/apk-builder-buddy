import { useState, useEffect, useRef, useCallback } from 'react';
import type { 
  WSMessage, 
  StatusMessage, 
  TranscriptMessage, 
  HardwareStatusMessage,
  TranscriptEntry, 
  AIState, 
  HardwareStatusData,
  LanguageMode 
} from '@/types';

interface UseWebSocketOptions {
  serverIp: string;
  port: string;
  onMessage?: (message: WSMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  aiState: AIState;
  transcripts: TranscriptEntry[];
  hardwareStatus: HardwareStatusData;
  isMuted: boolean;
  currentLanguage: LanguageMode;
  sendMessage: (message: object) => boolean;
  wakeAI: () => boolean;
  stopAI: () => boolean;
  setLanguage: (mode: LanguageMode) => boolean;
  toggleMute: () => boolean;
  clearContext: () => boolean;
  reconnectAttempts: number;
  clearTranscripts: () => void;
}

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

const DEFAULT_HARDWARE_STATUS: HardwareStatusData = {
  ai_core: 'offline',
  mic: 'offline',
  camera: 'offline',
  ping: 0,
};

export function useWebSocket({
  serverIp,
  port,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [aiState, setAiState] = useState<AIState>('idle');
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatusData>(DEFAULT_HARDWARE_STATUS);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageMode>('thai');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isManualDisconnectRef = useRef(false);

  const connect = useCallback(() => {
    if (!serverIp || !port) return;
    
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    isManualDisconnectRef.current = false;
    setConnectionState('connecting');

    const wsUrl = `ws://${serverIp}:${port}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionState('connected');
        setReconnectAttempts(0);
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          
          if (message.event === 'status') {
            const statusMsg = message as StatusMessage;
            setAiState(statusMsg.state);
          }
          
          if (message.event === 'transcript') {
            const transcriptMsg = message as TranscriptMessage;
            const newEntry: TranscriptEntry = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              speaker: transcriptMsg.speaker,
              text: transcriptMsg.text,
              timestamp: new Date(),
            };
            setTranscripts((prev) => [...prev, newEntry]);
          }

          if (message.event === 'hardware_status') {
            const hwMsg = message as HardwareStatusMessage;
            setHardwareStatus({
              ai_core: hwMsg.ai_core,
              mic: hwMsg.mic,
              camera: hwMsg.camera,
              ping: hwMsg.ping,
            });
          }
          
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setConnectionState('disconnected');
        setHardwareStatus(DEFAULT_HARDWARE_STATUS);
        onDisconnect?.();

        if (!isManualDisconnectRef.current && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          setConnectionState('reconnecting');
          setReconnectAttempts((prev) => prev + 1);
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionState('disconnected');
    }
  }, [serverIp, port, onMessage, onConnect, onDisconnect, onError, reconnectAttempts]);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionState('disconnected');
    setReconnectAttempts(0);
    setHardwareStatus(DEFAULT_HARDWARE_STATUS);
  }, []);

  const sendMessage = useCallback((message: object): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        return false;
      }
    }
    return false;
  }, []);

  const wakeAI = useCallback((): boolean => {
    return sendMessage({ action: 'wake' });
  }, [sendMessage]);

  const stopAI = useCallback((): boolean => {
    return sendMessage({ action: 'stop_audio' });
  }, [sendMessage]);

  const setLanguage = useCallback((mode: LanguageMode): boolean => {
    const success = sendMessage({ action: 'set_language', mode });
    if (success) {
      setCurrentLanguage(mode);
    }
    return success;
  }, [sendMessage]);

  const toggleMute = useCallback((): boolean => {
    const newState = !isMuted;
    const success = sendMessage({ action: 'toggle_mute', state: newState });
    if (success) {
      setIsMuted(newState);
    }
    return success;
  }, [sendMessage, isMuted]);

  const clearContext = useCallback((): boolean => {
    return sendMessage({ action: 'clear_context' });
  }, [sendMessage]);

  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
  }, []);

  useEffect(() => {
    if (serverIp && port) {
      setReconnectAttempts(0);
      connect();
    }

    return () => {
      disconnect();
    };
  }, [serverIp, port, connect, disconnect]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, []);

  return {
    isConnected,
    connectionState,
    aiState,
    transcripts,
    hardwareStatus,
    isMuted,
    currentLanguage,
    sendMessage,
    wakeAI,
    stopAI,
    setLanguage,
    toggleMute,
    clearContext,
    reconnectAttempts,
    clearTranscripts,
  };
}
