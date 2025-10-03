'use client';

import React from 'react';
import { useVapi } from '@/hooks/useVapi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, MessageSquare } from 'lucide-react';

export const VapiAgent: React.FC = () => {
  const {
    isCallActive,
    isMuted,
    isLoading,
    error,
    messages,
    volumeLevel,
    isSpeaking,
    startCall,
    endCall,
    toggleMute,
    clearMessages,
    clearError,
  } = useVapi();

  const getStatusColor = () => {
    if (error) return 'destructive';
    if (isCallActive) return 'default';
    if (isLoading) return 'secondary';
    return 'outline';
  };

  const getStatusText = () => {
    if (error) return 'Error';
    if (isCallActive) return 'Connected';
    if (isLoading) return 'Connecting...';
    return 'Disconnected';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Voice Assistant</h1>
        <p className="text-muted-foreground">
          Click the microphone to start talking with your AI assistant
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Connection Status</span>
            <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-4">
            {/* Main Call Button */}
            <Button
              onClick={isCallActive ? endCall : startCall}
              disabled={isLoading}
              size="lg"
              variant={isCallActive ? "destructive" : "default"}
              className="w-32 h-32 rounded-full"
            >
              {isCallActive ? (
                <PhoneOff className="w-12 h-12" />
              ) : (
                <Phone className="w-12 h-12" />
              )}
            </Button>

            {/* Mute Button */}
            {isCallActive && (
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
                className="w-16 h-16 rounded-full"
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </Button>
            )}
          </div>

          {/* Volume Indicator */}
          {isCallActive && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center space-x-2">
                {volumeLevel > 0 ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <span className="text-sm text-muted-foreground">
                  Volume: {Math.round(volumeLevel * 100)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-200"
                  style={{ width: `${volumeLevel * 100}%` }}
                />
              </div>
              {isSpeaking && (
                <div className="flex items-center justify-center">
                  <Badge variant="secondary" className="animate-pulse">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Assistant is speaking...
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-destructive rounded-full" />
                <span className="text-destructive font-medium">Error:</span>
                <span className="text-sm">{error}</span>
              </div>
              <Button onClick={clearError} variant="outline" size="sm">
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Conversation</span>
              <Button onClick={clearMessages} variant="outline" size="sm">
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 w-full">
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};