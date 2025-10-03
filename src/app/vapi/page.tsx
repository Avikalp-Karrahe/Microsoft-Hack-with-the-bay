'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VapiAgent } from '@/components/VapiAgent';
import { VapiCLI } from '@/components/VapiCLI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  Terminal, 
  Zap, 
  MessageSquare, 
  Phone,
  Settings,
  CheckCircle,
  Circle
} from 'lucide-react';

export default function VapiPage() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Mic className="w-8 h-8 text-primary" />
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor()}`} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  VAPI Voice Assistant
                </h1>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                  <span className="text-sm text-muted-foreground">{getStatusText()}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the future of voice interaction with AI-powered conversations
          </p>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Real-time Voice</h3>
                  <p className="text-sm text-muted-foreground">
                    Instant voice recognition and response
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Natural Conversations</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered natural language understanding
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Customizable</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to your own VAPI dashboard agents
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Tabs defaultValue="agent" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="agent" className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Voice Agent</span>
              </TabsTrigger>
              <TabsTrigger value="cli" className="flex items-center space-x-2">
                <Terminal className="w-4 h-4" />
                <span>CLI Interface</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agent" className="space-y-6">
              <VapiAgent />
            </TabsContent>

            <TabsContent value="cli" className="space-y-6">
              <VapiCLI />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Integration Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Connect Your VAPI Agent</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Setup Instructions</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Create VAPI Account</p>
                        <p className="text-sm text-muted-foreground">
                          Sign up at dashboard.vapi.ai and create your assistant
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Get API Keys</p>
                        <p className="text-sm text-muted-foreground">
                          Copy your public and private keys from the dashboard
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Circle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Configure Environment</p>
                        <p className="text-sm text-muted-foreground">
                          Add your keys to the .env.local file
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Circle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Update Configuration</p>
                        <p className="text-sm text-muted-foreground">
                          Set your assistant ID in the VAPI configuration
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Environment Variables</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">
                      <div>VAPI_PUBLIC_KEY=your_public_key</div>
                      <div>VAPI_PRIVATE_KEY=your_private_key</div>
                      <div>NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_public_key</div>
                    </code>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Configuration Options</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Use assistantId to connect to dashboard agents</p>
                      <p>• Customize voice, model, and behavior settings</p>
                      <p>• Configure transcription and function calling</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-center space-y-4">
                <h3 className="font-semibold text-lg">Ready to Get Started?</h3>
                <p className="text-muted-foreground">
                  Choose between the intuitive Voice Agent interface or the powerful CLI for advanced control
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Voice Agent
                  </Button>
                  <Button variant="outline" size="sm">
                    <Terminal className="w-4 h-4 mr-2" />
                    CLI Interface
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}