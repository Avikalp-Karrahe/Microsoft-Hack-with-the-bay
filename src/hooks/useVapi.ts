'use client';

import { useState, useEffect, useCallback } from 'react';
import { setupVapiEventHandlers, startCall, stopCall, sendMessage, setMuted } from '@/lib/vapi';

export interface VapiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface VapiState {
  isCallActive: boolean;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  messages: VapiMessage[];
  volumeLevel: number;
  isSpeaking: boolean;
}

export const useVapi = () => {
  const [state, setState] = useState<VapiState>({
    isCallActive: false,
    isMuted: false,
    isLoading: false,
    error: null,
    messages: [],
    volumeLevel: 0,
    isSpeaking: false,
  });

  // Event handlers
  const handleCallStart = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCallActive: true,
      isLoading: false,
      error: null,
    }));
  }, []);

  const handleCallEnd = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCallActive: false,
      isLoading: false,
      isSpeaking: false,
      volumeLevel: 0,
    }));
  }, []);

  const handleSpeechStart = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSpeaking: true,
    }));
  }, []);

  const handleSpeechEnd = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSpeaking: false,
    }));
  }, []);

  const handleMessage = useCallback((message: Record<string, unknown>) => {
    if (message.type === 'transcript' && message.transcript) {
      const newMessage: VapiMessage = {
        role: (message.role as 'user' | 'assistant' | 'system') || 'user',
        content: message.transcript as string,
        timestamp: new Date(),
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));
    }
  }, []);

  const handleError = useCallback((error: Error | { message?: string }) => {
    setState(prev => ({
      ...prev,
      error: error.message || 'An error occurred',
      isLoading: false,
    }));
  }, []);

  const handleVolumeLevel = useCallback((volume: number) => {
    setState(prev => ({
      ...prev,
      volumeLevel: volume,
    }));
  }, []);

  // Setup event handlers on mount
  useEffect(() => {
    setupVapiEventHandlers(
      handleCallStart,
      handleCallEnd,
      handleSpeechStart,
      handleSpeechEnd,
      handleMessage,
      handleError,
      handleVolumeLevel
    );
  }, [
    handleCallStart,
    handleCallEnd,
    handleSpeechStart,
    handleSpeechEnd,
    handleMessage,
    handleError,
    handleVolumeLevel,
  ]);

  // Actions
  const startVoiceCall = useCallback(async (phoneNumber?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await startCall(phoneNumber);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start call';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  }, []);

  const endVoiceCall = useCallback(() => {
    stopCall();
  }, []);

  const sendVoiceMessage = useCallback((message: string) => {
    try {
      sendMessage(message);
      
      // Add user message to state
      const userMessage: VapiMessage = {
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    const newMutedState = !state.isMuted;
    setMuted(newMutedState);
    setState(prev => ({
      ...prev,
      isMuted: newMutedState,
    }));
  }, [state.isMuted]);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    startCall: startVoiceCall,
    endCall: endVoiceCall,
    sendMessage: sendVoiceMessage,
    toggleMute,
    clearMessages,
    clearError,
  };
};