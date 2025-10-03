'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useVapi } from '@/hooks/useVapi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Terminal, 
  Send, 
  Trash2, 
  Phone, 
  PhoneOff,
  Mic,
  MicOff,
  Copy,
  Download
} from 'lucide-react';

interface CLICommand {
  command: string;
  output: string;
  timestamp: Date;
  type: 'command' | 'response' | 'system' | 'error';
}

export interface VapiCLIProps {
  assistantId?: string;
  className?: string;
}

export const VapiCLI: React.FC<VapiCLIProps> = ({
  assistantId,
  className = '',
}) => {
  const [commands, setCommands] = useState<CLICommand[]>([
    {
      command: 'vapi --help',
      output: 'VAPI CLI - Voice Assistant Interface\n\nAvailable commands:\n  start [assistant-id]  - Start voice call\n  stop                  - End voice call\n  mute                  - Toggle mute\n  say <message>         - Make assistant speak\n  send <message>        - Send message to assistant\n  clear                 - Clear terminal\n  status                - Show call status\n  help                  - Show this help',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isCallActive,
    isMuted,
    isLoading,
    error,
    messages,
    startCall,
    endCall,
    toggleMute,
    sendMessage,
    sayMessage,
    clearMessages,
  } = useVapi();

  // Auto-scroll to bottom when new commands are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [commands]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Add system messages when VAPI state changes
  useEffect(() => {
    if (isCallActive) {
      addCommand('', 'Voice call started successfully', 'system');
    }
  }, [isCallActive]);

  useEffect(() => {
    if (error) {
      addCommand('', `Error: ${error}`, 'error');
    }
  }, [error]);

  // Add VAPI messages to CLI
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage) {
      const output = `[${latestMessage.role?.toUpperCase() || 'SYSTEM'}] ${latestMessage.content || latestMessage.transcript || 'No content'}`;
      addCommand('', output, 'response');
    }
  }, [messages]);

  const addCommand = (command: string, output: string, type: CLICommand['type'] = 'command') => {
    setCommands(prev => [...prev, {
      command,
      output,
      timestamp: new Date(),
      type
    }]);
  };

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // Add to history
    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    const parts = trimmedCmd.split(' ');
    const baseCommand = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (baseCommand) {
        case 'start':
          if (isCallActive) {
            addCommand(trimmedCmd, 'Call is already active', 'error');
          } else {
            addCommand(trimmedCmd, 'Starting voice call...', 'command');
            await startCall(args[0] || assistantId);
          }
          break;

        case 'stop':
          if (!isCallActive) {
            addCommand(trimmedCmd, 'No active call to stop', 'error');
          } else {
            addCommand(trimmedCmd, 'Ending voice call...', 'command');
            endCall();
            addCommand('', 'Voice call ended', 'system');
          }
          break;

        case 'mute':
          if (!isCallActive) {
            addCommand(trimmedCmd, 'No active call to mute/unmute', 'error');
          } else {
            toggleMute();
            addCommand(trimmedCmd, `Microphone ${isMuted ? 'unmuted' : 'muted'}`, 'command');
          }
          break;

        case 'say':
          if (!isCallActive) {
            addCommand(trimmedCmd, 'No active call. Start a call first.', 'error');
          } else if (args.length === 0) {
            addCommand(trimmedCmd, 'Usage: say <message>', 'error');
          } else {
            const message = args.join(' ');
            sayMessage(message);
            addCommand(trimmedCmd, `Making assistant say: "${message}"`, 'command');
          }
          break;

        case 'send':
          if (!isCallActive) {
            addCommand(trimmedCmd, 'No active call. Start a call first.', 'error');
          } else if (args.length === 0) {
            addCommand(trimmedCmd, 'Usage: send <message>', 'error');
          } else {
            const message = args.join(' ');
            sendMessage(message);
            addCommand(trimmedCmd, `Sent message: "${message}"`, 'command');
          }
          break;

        case 'clear':
          setCommands([]);
          addCommand('', 'Terminal cleared', 'system');
          break;

        case 'status':
          const status = isCallActive ? 'Active' : 'Inactive';
          const muteStatus = isMuted ? 'Muted' : 'Unmuted';
          const messageCount = messages.length;
          addCommand(trimmedCmd, `Call Status: ${status}\nMicrophone: ${muteStatus}\nMessages: ${messageCount}`, 'command');
          break;

        case 'help':
        case '--help':
          addCommand(trimmedCmd, 'VAPI CLI - Voice Assistant Interface\n\nAvailable commands:\n  start [assistant-id]  - Start voice call\n  stop                  - End voice call\n  mute                  - Toggle mute\n  say <message>         - Make assistant speak\n  send <message>        - Send message to assistant\n  clear                 - Clear terminal\n  status                - Show call status\n  help                  - Show this help', 'command');
          break;

        default:
          addCommand(trimmedCmd, `Unknown command: ${baseCommand}. Type 'help' for available commands.`, 'error');
      }
    } catch (error: any) {
      addCommand(trimmedCmd, `Error executing command: ${error.message}`, 'error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentCommand);
    setCurrentCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  const getCommandTypeColor = (type: CLICommand['type']) => {
    switch (type) {
      case 'command': return 'text-blue-400';
      case 'response': return 'text-green-400';
      case 'system': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const copyToClipboard = () => {
    const content = commands.map(cmd => 
      `[${cmd.timestamp.toLocaleTimeString()}] ${cmd.command ? `$ ${cmd.command}\n` : ''}${cmd.output}`
    ).join('\n\n');
    navigator.clipboard.writeText(content);
  };

  const downloadLog = () => {
    const content = commands.map(cmd => 
      `[${cmd.timestamp.toISOString()}] ${cmd.command ? `$ ${cmd.command}\n` : ''}${cmd.output}`
    ).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vapi-cli-log-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              VAPI CLI
            </span>
            <div className="flex items-center gap-2">
              <Badge variant={isCallActive ? "default" : "secondary"}>
                {isCallActive ? 'Connected' : 'Disconnected'}
              </Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadLog}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCommands([])}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Terminal Output */}
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
            <ScrollArea className="h-96" ref={scrollAreaRef}>
              <div className="space-y-2">
                {commands.map((cmd, index) => (
                  <div key={index} className="space-y-1">
                    {cmd.command && (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400">$</span>
                        <span className="text-white">{cmd.command}</span>
                        <span className="text-gray-500 text-xs ml-auto">
                          {cmd.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    <div className={`whitespace-pre-wrap ${getCommandTypeColor(cmd.type)} pl-4`}>
                      {cmd.output}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-yellow-400 pl-4">
                    Processing...
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Command Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 font-mono">
                $
              </span>
              <Input
                ref={inputRef}
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter VAPI command..."
                className="pl-8 font-mono"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || !currentCommand.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeCommand(isCallActive ? 'stop' : 'start')}
              disabled={isLoading}
            >
              {isCallActive ? <PhoneOff className="h-4 w-4 mr-1" /> : <Phone className="h-4 w-4 mr-1" />}
              {isCallActive ? 'Stop' : 'Start'}
            </Button>
            
            {isCallActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand('mute')}
              >
                {isMuted ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeCommand('status')}
            >
              Status
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeCommand('help')}
            >
              Help
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};