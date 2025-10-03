'use client';

import React, { useEffect, useState } from 'react';
import { useVapi } from '@/hooks/useVapi';
import { useQdrant } from '@/hooks/useQdrant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, MessageSquare, Database, User } from 'lucide-react';

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

  const {
    isLoading: isQdrantLoading,
    error: qdrantError,
    customerData,
    conversationContext,
    searchCustomerByZip,
    generateContext,
    clearData: clearQdrantData,
    clearError: clearQdrantError,
  } = useQdrant();

  const [zipCodeInput, setZipCodeInput] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPersonalized, setIsPersonalized] = useState(false);

  // Phone number validation
  const isValidPhoneNumber = (phone: string) => {
    // Basic phone number validation (10 digits with optional formatting)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
  };

  // Handle call initiation
  const handleStartCall = () => {
    if (phoneNumber.trim()) {
      startCall(phoneNumber.trim());
    } else {
      startCall();
    }
  };
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user' && lastMessage.content) {
        // Look for ZIP code patterns (5 digits)
        const zipMatch = lastMessage.content.match(/\b\d{5}\b/);
        if (zipMatch && !isPersonalized) {
          handleZipCodeDetected(zipMatch[0]);
        }
      }
    }
  }, [messages, isPersonalized]);

  const handleZipCodeDetected = async (zipCode: string) => {
    console.log('ZIP code detected:', zipCode);
    const customer = await searchCustomerByZip(zipCode);
    
    if (customer) {
      console.log('Customer found:', customer);
      setIsPersonalized(true);
      
      // Generate conversation context
      await generateContext(customer);
      
      // You could send this context to VAPI here if needed
      // For now, it's available in the conversationContext state
    }
  };

  const handleManualZipSearch = async () => {
    if (zipCodeInput.trim()) {
      await handleZipCodeDetected(zipCodeInput.trim());
      setZipCodeInput('');
    }
  };

  const handleClearPersonalization = () => {
    setIsPersonalized(false);
    clearQdrantData();
    setZipCodeInput('');
  };

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
          {/* Phone Number Input */}
          <div className="mb-6 space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number (optional - leave empty for web call)
            </label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-center"
              disabled={isCallActive}
            />
            {phoneNumber && !isValidPhoneNumber(phoneNumber) && (
              <p className="text-sm text-destructive">
                Please enter a valid phone number (at least 10 digits)
              </p>
            )}
          </div>

          <div className="flex items-center justify-center space-x-4">
            {/* Main Call Button */}
            <Button
              onClick={isCallActive ? endCall : handleStartCall}
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
      {(error || qdrantError) && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive mb-4">
              {error || qdrantError}
            </p>
            <div className="flex space-x-2">
              {error && (
                <Button onClick={clearError} variant="outline" size="sm">
                  Clear VAPI Error
                </Button>
              )}
              {qdrantError && (
                <Button onClick={clearQdrantError} variant="outline" size="sm">
                  Clear Database Error
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Personalization Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Customer Personalization</span>
            {isPersonalized && (
              <Badge variant="default" className="ml-2">
                <User className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Manual ZIP Code Search */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter ZIP code to personalize..."
              value={zipCodeInput}
              onChange={(e) => setZipCodeInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              maxLength={5}
              pattern="[0-9]{5}"
            />
            <Button 
              onClick={handleManualZipSearch}
              disabled={isQdrantLoading || !zipCodeInput.trim()}
              size="sm"
            >
              {isQdrantLoading ? 'Searching...' : 'Search'}
            </Button>
            {isPersonalized && (
              <Button 
                onClick={handleClearPersonalization}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Customer Data Display */}
          {customerData && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Customer Profile:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Name:</strong> {customerData.name}</div>
                <div><strong>ZIP:</strong> {customerData.zip}</div>
                <div><strong>Loan Amount:</strong> ${customerData.loanAmount.toLocaleString()}</div>
                <div><strong>Days Late:</strong> {customerData.daysLate}</div>
                <div><strong>Balance:</strong> ${customerData.balance.toLocaleString()}</div>
                <div><strong>Payment Capacity:</strong> {customerData.paymentCapacity}</div>
                <div><strong>Risk Level:</strong> {customerData.riskLevel}</div>
                <div><strong>Reason:</strong> {customerData.reason}</div>
              </div>
            </div>
          )}

          {/* Conversation Context */}
          {conversationContext && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">AI Context:</h4>
              <div className="text-sm space-y-1">
                <div><strong>Approach:</strong> {conversationContext.suggestedApproach}</div>
                <div><strong>Key Points:</strong></div>
                <ul className="list-disc list-inside ml-2 text-xs">
                  {conversationContext.keyTalkingPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
                {conversationContext.riskFactors.length > 0 && (
                  <>
                    <div><strong>Risk Factors:</strong></div>
                    <ul className="list-disc list-inside ml-2 text-xs text-orange-600">
                      {conversationContext.riskFactors.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!isPersonalized && (
            <div className="text-sm text-muted-foreground">
              <p>Enter a ZIP code above or mention one during the call to personalize the agent with real customer data from the vector database.</p>
            </div>
          )}
        </CardContent>
      </Card>

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