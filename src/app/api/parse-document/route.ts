import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const { documentUrl } = await request.json();

    if (!documentUrl) {
      return NextResponse.json(
        { error: 'Document URL is required' },
        { status: 400 }
      );
    }

    // Call Flask backend with the document URL
    // Flask will download and parse it
    const flaskUrl = process.env.FLASK_BACKEND_URL || 'http://localhost:3001';
    const parseResponse = await fetch(`${flaskUrl}/api/documents/parse-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: documentUrl,
      }),
    });

    if (!parseResponse.ok) {
      const errorData = await parseResponse.json();
      throw new Error(errorData.error || 'Flask backend parsing failed');
    }

    const parseResult = await parseResponse.json();

    return NextResponse.json({
      success: true,
      data: parseResult,
    });
  } catch (error) {
    console.error('Error parsing document:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get list of documents from Vercel Blob
    const { blobs } = await list();

    console.log('Total blobs found:', blobs.length);
    console.log('Blobs:', JSON.stringify(blobs, null, 2));

    if (blobs.length === 0) {
      return NextResponse.json({
        success: true,
        documents: [],
        message: 'No documents found'
      });
    }

    // Sort by uploadedAt to get most recent
    const sortedBlobs = blobs.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    const latestDocument = sortedBlobs[0];

    console.log('Latest document:', latestDocument.url);

    return NextResponse.json({
      success: true,
      document: {
        name: latestDocument.pathname,
        url: latestDocument.url,
        size: latestDocument.size,
        uploadedAt: latestDocument.uploadedAt,
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
