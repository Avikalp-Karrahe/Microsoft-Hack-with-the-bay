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

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    // Automatically trigger document parsing after successful upload
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? `https://${request.headers.get('host')}` 
        : 'http://localhost:3000';
      
      const parseResponse = await fetch(`${baseUrl}/api/documents/parse-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: blob.url,
        }),
      });

      if (!parseResponse.ok) {
        console.error('Parse response error:', await parseResponse.text());
        // Don't fail the upload if parsing fails, just log the error
      } else {
        const parseResult = await parseResponse.json();
        console.log('Document parsed successfully:', parseResult);
        
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
      console.error('Error parsing document:', parseError);
      // Continue with upload success even if parsing fails
    }

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
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
