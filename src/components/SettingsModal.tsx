import { useState, useEffect } from 'react';
import { X, Server, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ServerSettings } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ServerSettings;
  onSave: (settings: ServerSettings) => void;
}

const DEFAULT_SETTINGS: ServerSettings = {
  serverIp: '192.168.1.100',
  port: '8080',
};

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<ServerSettings>(settings);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  const isValidIp = (ip: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip) || ip === 'localhost';
  };

  const isValidPort = (port: string) => {
    const portNum = parseInt(port, 10);
    return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
  };

  const canSave = isValidIp(localSettings.serverIp) && isValidPort(localSettings.port);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Server className="w-6 h-6 text-blue-400" />
            Server Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="server-ip" className="text-slate-300">
              Server IP Address
            </Label>
            <Input
              id="server-ip"
              type="text"
              placeholder="192.168.1.100"
              value={localSettings.serverIp}
              onChange={(e) => setLocalSettings({ ...localSettings, serverIp: e.target.value })}
              className={`
                bg-slate-800 border-slate-600 text-white placeholder:text-slate-500
                focus:border-blue-500 focus:ring-blue-500/20
                ${!isValidIp(localSettings.serverIp) && localSettings.serverIp ? 'border-red-500' : ''}
              `}
            />
            <p className="text-xs text-slate-500">
              Enter the IP address of your Lenovo laptop running Namo AI server
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="port" className="text-slate-300">
              Port Number
            </Label>
            <Input
              id="port"
              type="text"
              placeholder="8080"
              value={localSettings.port}
              onChange={(e) => setLocalSettings({ ...localSettings, port: e.target.value })}
              className={`
                bg-slate-800 border-slate-600 text-white placeholder:text-slate-500
                focus:border-blue-500 focus:ring-blue-500/20
                ${!isValidPort(localSettings.port) && localSettings.port ? 'border-red-500' : ''}
              `}
            />
            <p className="text-xs text-slate-500">
              WebSocket port (default: 8080)
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-sm text-slate-400">Connection URL Preview:</p>
            <code className="mt-1 block text-sm text-blue-400 font-mono">
              ws://{localSettings.serverIp || '...'}:{localSettings.port || '...'}
            </code>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
