import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }



    console.log('📁 Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Upload to Vercel Blob with public access
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    console.log('✅ Uploaded to Vercel Blob:', blob.url);
    console.log('🔗 Blob details:', {
      pathname: blob.pathname,
      contentType: blob.contentType,
      access: 'public'
    });

    // Automatically trigger document parsing after successful upload
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${request.headers.get('host')}` 
        : 'http://localhost:3000';
      
      console.log('🚀 Triggering auto-parse for blob URL:', blob.url);
      
      const parseResponse = await fetch(`${baseUrl}/api/documents/parse-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: blob.url,
        }),
      });

      console.log('📡 Auto-parse response status:', parseResponse.status);
      const responseText = await parseResponse.text();
      console.log('📄 Auto-parse response length:', responseText.length);

      if (!parseResponse.ok) {
        console.error('❌ Auto-parse failed:', responseText);
        // Don't fail the upload if parsing fails, just log the error
      } else {
        const parseResult = JSON.parse(responseText);
        console.log('✅ Auto-parse successful:', {
          success: parseResult.success,
          total_chunks: parseResult.total_chunks,
          total_pages: parseResult.summary?.total_pages
        });
        
        // Store parsed data in response for immediate use
        return NextResponse.json({
          success: true,
          file: {
            url: blob.url,
            pathname: blob.pathname,
            contentType: blob.contentType,
            size: file.size,
          },
          parsedData: parseResult,
          autoParsed: true,
        });
      }
    } catch (parseError) {
      console.error('💥 Error during auto-parse:', parseError);
      // Continue with upload success even if parsing fails
    }

    console.log('📤 Returning upload success without parsed data');

    return NextResponse.json({
      success: true,
      file: {
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
        size: file.size,
      },
      autoParsed: false,
    });
  } catch (error) {
    console.error('💥 Error uploading to Vercel Blob:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
