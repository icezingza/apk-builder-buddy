// AI State types
export type AIState = 'idle' | 'listening' | 'thinking' | 'speaking';

// Hardware Status types
export type HardwareStatus = 'online' | 'offline';

export interface HardwareStatusData {
  ai_core: HardwareStatus;
  mic: HardwareStatus;
  camera: HardwareStatus;
  ping: number;
}

// Language modes
export type LanguageMode = 'thai' | 'pali-thai' | 'english';

export const LANGUAGE_OPTIONS: { value: LanguageMode; label: string }[] = [
  { value: 'thai', label: 'Thai (Normal)' },
  { value: 'pali-thai', label: 'Pali-Thai' },
  { value: 'english', label: 'English' },
];

// Transcript entry
export interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'namo';
  text: string;
  timestamp: Date;
}

// WebSocket Message Types
export interface WSMessage {
  event: string;
  [key: string]: unknown;
}

export interface StatusMessage extends WSMessage {
  event: 'status';
  state: AIState;
}

export interface TranscriptMessage extends WSMessage {
  event: 'transcript';
  speaker: 'user' | 'namo';
  text: string;
}

export interface HardwareStatusMessage extends WSMessage {
  event: 'hardware_status';
  ai_core: HardwareStatus;
  mic: HardwareStatus;
  camera: HardwareStatus;
  ping: number;
}

// Settings
export interface ServerSettings {
  serverIp: string;
  port: string;
}

// Connection state
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
