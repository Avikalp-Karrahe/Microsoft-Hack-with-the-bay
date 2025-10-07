import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function convertImageToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

function getMediaType(filename: string): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images') as File[];

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    const borrowers = [];

    // Process each image
    for (const image of images) {
      const base64Image = await convertImageToBase64(image);
      const mediaType = getMediaType(image.name);

      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: `You are a data extraction expert. Analyze this borrower information card image and extract the following information in JSON format:

{
  "name": "Full name of the borrower",
  "loan_number": "Loan number (e.g., LN-2024-0623)",
  "outstanding_balance": "Outstanding balance amount (e.g., $15,000)",
  "days_past_due": Days past due as a number (e.g., 25),
  "last_payment_date": "Last payment date (e.g., 2024-01-15)",
  "phone": "Phone number",
  "address": "Full address",
  "delinquent_status": "Delinquent status (e.g., Delinquent, Current, etc.)"
}

If any field is not visible or cannot be determined, use "N/A" for strings and 0 for numbers.
Return ONLY the JSON object, no additional text.`,
              },
            ],
          },
        ],
      });

      const textContent = message.content.find((block) => block.type === 'text');
      if (textContent && textContent.type === 'text') {
        try {
          // Extract JSON from the response
          const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const borrowerData = JSON.parse(jsonMatch[0]);
            borrowers.push(borrowerData);
          }
        } catch (e) {
          console.error('Failed to parse borrower data:', e);
          console.error('Response text:', textContent.text);
        }
      }
    }

    return NextResponse.json({
      success: true,
      borrowers,
    });
  } catch (error) {
    console.error('Error parsing images:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse images',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
