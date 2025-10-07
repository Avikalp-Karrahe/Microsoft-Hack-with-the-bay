import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Call the Python backend with Pathway and Landing AI integration
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'https://vercdemo-production.up.railway.app';
    const backendResponse = await fetch(`${pythonBackendUrl}/documents/parse-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      throw new Error(`Backend error: ${backendResponse.status} - ${errorData.error || 'Unknown error'}`);
    }

    const result = await backendResponse.json();
    
    // Return the result from the Python backend
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in parse-url route:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}