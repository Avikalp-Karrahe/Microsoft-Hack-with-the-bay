import Vapi from '@vapi-ai/web';

// Initialize VAPI client
const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

if (!publicKey || publicKey === 'your_vapi_public_key_here') {
  console.warn('VAPI public key not configured. Please set NEXT_PUBLIC_VAPI_PUBLIC_KEY in your .env.local file');
}

export const vapi = new Vapi(publicKey || '');

// Configuration for connecting to your dashboard agent
export const dashboardAgentConfig = {
  // Option 1: Use your existing assistant ID from the dashboard
  // assistantId: 'your-assistant-id-from-dashboard',
  
  // Option 2: Create assistant inline (if you prefer to configure here)
  assistant: {
    name: 'Dashboard Agent',
    model: {
      provider: 'openai',
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful voice assistant created through the VAPI dashboard. You can help users with various tasks and provide information in a conversational manner.'
        }
      ]
    },
    voice: {
      provider: '11labs',
      voiceId: 'rachel'
    },
    firstMessage: 'Hello! I\'m your voice assistant. How can I help you today?'
  }
};

// Event handlers for VAPI
export const setupVapiEventHandlers = (
  onCallStart?: () => void,
  onCallEnd?: () => void,
  onSpeechStart?: () => void,
  onSpeechEnd?: () => void,
  onMessage?: (message: any) => void,
  onError?: (error: any) => void,
  onVolumeLevel?: (volume: number) => void
) => {
  vapi.on('call-start', () => {
    console.log('Call started');
    onCallStart?.();
  });

  vapi.on('call-end', () => {
    console.log('Call ended');
    onCallEnd?.();
  });

  vapi.on('speech-start', () => {
    console.log('Speech started');
    onSpeechStart?.();
  });

  vapi.on('speech-end', () => {
    console.log('Speech ended');
    onSpeechEnd?.();
  });

  vapi.on('message', (message) => {
    console.log('Message:', message);
    onMessage?.(message);
  });

  vapi.on('error', (error) => {
    console.error('VAPI Error:', error);
    onError?.(error);
  });

  vapi.on('volume-level', (volume) => {
    onVolumeLevel?.(volume);
  });
};

// Start a call with your dashboard agent
export const startCall = async () => {
  try {
    // Check if VAPI is properly configured
    if (!publicKey || publicKey === 'your_vapi_public_key_here') {
      throw new Error('VAPI public key not configured. Please set NEXT_PUBLIC_VAPI_PUBLIC_KEY in your .env.local file');
    }

    // Get assistant ID from environment if available
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    
    if (assistantId && assistantId !== 'your_assistant_id_here') {
      // Option 1: Use assistant ID (recommended for dashboard agents)
      await vapi.start(assistantId);
    } else {
      // Option 2: Use inline configuration
      await vapi.start(dashboardAgentConfig as any);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to start call:', error);
    throw error;
  }
};

// Stop the current call
export const stopCall = () => {
  vapi.stop();
};

// Send a message during the call
export const sendMessage = (message: string) => {
  vapi.send({
    type: 'add-message',
    message: {
      role: 'user',
      content: message
    }
  });
};

// Toggle mute
export const setMuted = (muted: boolean) => {
  vapi.setMuted(muted);
};

// Check if currently in a call
export const isCallActive = () => {
  return vapi.isMuted !== undefined; // Simple check for active call
};