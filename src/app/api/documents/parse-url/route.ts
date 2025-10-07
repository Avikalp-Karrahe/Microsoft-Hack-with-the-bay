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

    console.log('🔍 Parsing document URL:', url);

    // First, verify the URL is accessible
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const testResponse = await fetch(url, { 
        method: 'HEAD', 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      if (!testResponse.ok) {
        console.error('❌ Document URL not accessible:', testResponse.status);
        return NextResponse.json({
          success: false,
          error: 'Document URL is not accessible',
          details: `HTTP ${testResponse.status}`
        }, { status: 400 });
      }
      console.log('✅ Document URL is accessible');
    } catch (urlError) {
      console.error('❌ URL accessibility check failed:', urlError);
      return NextResponse.json({
        success: false,
        error: 'Document URL is not accessible',
        details: urlError instanceof Error ? urlError.message : 'Unknown error'
      }, { status: 400 });
    }

    // Call the Python backend with Pathway and Landing AI integration
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'https://vercdemo-production.up.railway.app';
    console.log('🚀 Calling backend:', `${pythonBackendUrl}/documents/parse-url`);
    
    const backendResponse = await fetch(`${pythonBackendUrl}/documents/parse-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    console.log('📡 Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('❌ Backend error:', errorData);
      
      // Return a more helpful error response
      return NextResponse.json({
        success: false,
        error: 'Backend parsing failed',
        details: errorData.details || `HTTP ${backendResponse.status}`,
        backend_error: errorData.error || 'Unknown backend error'
      }, { status: 500 });
    }

    const result = await backendResponse.json();
    console.log('✅ Backend result summary:', {
      success: result.success,
      total_chunks: result.total_chunks,
      total_pages: result.summary?.total_pages,
      documents_count: result.summary?.documents?.length
    });

    // Check if we got valid results
    if (!result.success || result.total_chunks === 0) {
      console.warn('⚠️ Backend returned 0 chunks or failed');
      return NextResponse.json({
        success: false,
        error: 'Document parsing returned no content',
        details: 'The document may be empty, corrupted, or in an unsupported format',
        backend_result: result
      }, { status: 422 });
    }
    
    // Return the result from the Python backend
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('💥 Error in parse-url route:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}