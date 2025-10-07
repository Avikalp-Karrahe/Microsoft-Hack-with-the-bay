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

    // Upload to Vercel Blob with public access
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    console.log('Uploaded file URL:', blob.url);
    console.log('File access level: public');

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

      console.log('Parse response status:', parseResponse.status);
      const responseText = await parseResponse.text();
      console.log('Parse response body:', responseText);

      if (!parseResponse.ok) {
        console.error('Parse response error:', responseText);
        // Don't fail the upload if parsing fails, just log the error
      } else {
        const parseResult = JSON.parse(responseText);
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
