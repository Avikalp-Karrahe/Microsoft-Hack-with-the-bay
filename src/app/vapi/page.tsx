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
                  fin-verc voice agent
                </h1>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                  <span className="text-sm text-muted-foreground">{getStatusText()}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience an empathetic AI collections agent powered by VAPI voice technology
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
      </div>
    </div>
  );
}