import { Settings, Wifi, WifiOff, Loader2, Cpu, Mic, Video, Signal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ConnectionState, HardwareStatusData, LanguageMode } from '@/types';
import { LANGUAGE_OPTIONS } from '@/types';

interface HeaderProps {
  connectionState: ConnectionState;
  reconnectAttempts: number;
  hardwareStatus: HardwareStatusData;
  currentLanguage: LanguageMode;
  onSettingsClick: () => void;
  onLanguageChange: (mode: LanguageMode) => void;
}

interface HardwareIndicatorProps {
  label: string;
  status: 'online' | 'offline';
  icon: React.ReactNode;
}

function HardwareIndicator({ label, status, icon }: HardwareIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
      <span className={`w-2.5 h-2.5 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'} ${status === 'online' ? 'shadow-[0_0_6px_rgba(34,197,94,0.6)]' : ''}`} />
      <span className="text-slate-400">{icon}</span>
      <span className="text-xs font-medium text-slate-300">{label}</span>
    </div>
  );
}

export function Header({ 
  connectionState, 
  reconnectAttempts, 
  hardwareStatus,
  currentLanguage,
  onSettingsClick, 
  onLanguageChange,
}: HeaderProps) {
  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'Connected',
          dotColor: 'bg-green-500',
          textColor: 'text-green-400',
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Connecting...',
          dotColor: 'bg-yellow-500',
          textColor: 'text-yellow-400',
        };
      case 'reconnecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: `Reconnecting (${reconnectAttempts})`,
          dotColor: 'bg-orange-500',
          textColor: 'text-orange-400',
        };
      case 'disconnected':
      default:
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Disconnected',
          dotColor: 'bg-red-500',
          textColor: 'text-red-400',
        };
    }
  };

  const status = getStatusConfig();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-700">
      {/* Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white font-bold text-xl">N</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Namo AI
          </h1>
          <p className="text-sm text-slate-400">Control Center</p>
        </div>
      </div>

      {/* Hardware Status Section */}
      <div className="flex items-center gap-2">
        <HardwareIndicator 
          label="AI Core" 
          status={hardwareStatus.ai_core} 
          icon={<Cpu className="w-3.5 h-3.5" />}
        />
        <HardwareIndicator 
          label="Mic" 
          status={hardwareStatus.mic} 
          icon={<Mic className="w-3.5 h-3.5" />}
        />
        <HardwareIndicator 
          label="Camera" 
          status={hardwareStatus.camera} 
          icon={<Video className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Right Section: Ping, Language, Connection, Settings */}
      <div className="flex items-center gap-4">
        {/* Ping Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
          <Signal className={`w-4 h-4 ${hardwareStatus.ping > 0 && hardwareStatus.ping < 100 ? 'text-green-400' : hardwareStatus.ping >= 100 ? 'text-yellow-400' : 'text-slate-500'}`} />
          <span className="text-sm font-medium text-slate-300">
            {hardwareStatus.ping > 0 ? `${hardwareStatus.ping}ms` : '--'}
          </span>
        </div>

        {/* Language Dropdown */}
        <Select value={currentLanguage} onValueChange={(value) => onLanguageChange(value as LanguageMode)}>
          <SelectTrigger className="w-[150px] h-9 bg-slate-800 border-slate-700 text-slate-200 text-sm focus:ring-blue-500/20 focus:border-blue-500">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {LANGUAGE_OPTIONS.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-slate-200 focus:bg-slate-700 focus:text-white"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Connection Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700`}>
          <span className={`w-2.5 h-2.5 rounded-full ${status.dotColor} ${connectionState === 'connecting' || connectionState === 'reconnecting' ? 'animate-pulse' : ''}`} />
          <span className={`flex items-center gap-1.5 text-sm font-medium ${status.textColor}`}>
            {status.icon}
            {status.text}
          </span>
        </div>

        {/* Settings Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onSettingsClick}
          className="w-10 h-10 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-600"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
