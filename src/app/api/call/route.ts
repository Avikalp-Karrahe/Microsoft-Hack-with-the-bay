import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, assistantId, assistant } = await request.json();
    
    // Validate required environment variables
    const privateKey = process.env.VAPI_PRIVATE_KEY;
    const phoneNumberId = process.env.NEXT_PUBLIC_VAPI_PHONE_NUMBER_ID;
    
    if (!privateKey) {
      return NextResponse.json(
        { error: 'VAPI private key not configured' },
        { status: 500 }
      );
    }
    
    if (!phoneNumberId || phoneNumberId === 'your_phone_number_id_here') {
      return NextResponse.json(
        { error: 'Phone number ID not configured. Please set NEXT_PUBLIC_VAPI_PHONE_NUMBER_ID in your .env.local file.' },
        { status: 500 }
      );
    }
    
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    // Prepare the call payload
    const callPayload: any = {
      phoneNumberId: phoneNumberId,
      customer: {
        number: phoneNumber
      }
    };
    
    // Add assistant configuration
    if (assistantId) {
      callPayload.assistantId = assistantId;
    } else if (assistant) {
      callPayload.assistant = assistant;
    } else {
      return NextResponse.json(
        { error: 'Either assistantId or assistant configuration is required' },
        { status: 400 }
      );
    }
    
    // Make the API call to VAPI
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(callPayload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('VAPI API Error:', errorData);
      return NextResponse.json(
        { error: `Failed to initiate outbound call: ${errorData.message || response.statusText}` },
        { status: response.status }
      );
    }
    
    const callData = await response.json();
    console.log('Outbound call initiated:', callData);
    
    return NextResponse.json({ success: true, call: callData });
    
  } catch (error) {
    console.error('Error initiating outbound call:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}