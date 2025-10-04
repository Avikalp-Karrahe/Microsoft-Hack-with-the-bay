import { NextRequest, NextResponse } from 'next/server';
import { QdrantClient } from '@qdrant/js-client-rest';

// Initialize Qdrant client on server side
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || 'https://9ba88adc-2c28-463f-8ca3-ada19c93261f.us-west-2-0.aws.cloud.qdrant.io/',
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'loan_documents';

// Simple hash-based vector generation for demo purposes
function generateEmbedding(text: string): number[] {
  const vector = new Array(384).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    vector[i % 384] += charCode;
  }
  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}

export async function POST(request: NextRequest) {
  try {
    const { type, query, zipCode, customerId } = await request.json();

    switch (type) {
      case 'searchDocuments':
        try {
          const searchResult = await qdrantClient.search(COLLECTION_NAME, {
            vector: generateEmbedding(query),
            limit: 5,
            with_payload: true,
          });

          if (searchResult.length > 0) {
            return NextResponse.json({
              success: true,
              data: searchResult.map((result: any) => ({
                id: result.id,
                score: result.score,
                content: result.payload?.content || '',
                metadata: result.payload?.metadata || {},
              })),
            });
          }
        } catch (qdrantError) {
          console.log('Qdrant document search failed, using mock data:', qdrantError);
        }

        // Fallback to mock document data
        return NextResponse.json({
          success: true,
          data: [
            {
              id: 'doc_1',
              score: 0.95,
              content: `Mock loan document for query: "${query}". This document contains relevant information about loan terms, payment schedules, and customer obligations.`,
              metadata: {
                type: 'loan_agreement',
                created_at: '2024-01-15',
                customer_id: 'mock_customer'
              }
            },
            {
              id: 'doc_2',
              score: 0.87,
              content: `Additional mock document related to: "${query}". Contains supplementary information about loan processing and requirements.`,
              metadata: {
                type: 'loan_application',
                created_at: '2024-01-10',
                customer_id: 'mock_customer'
              }
            }
          ],
        });

      case 'getCustomerByZip':
        try {
          const zipResult = await qdrantClient.search(COLLECTION_NAME, {
            vector: generateEmbedding(`customer zip code ${zipCode}`),
            limit: 1,
            with_payload: true,
            filter: {
              must: [
                {
                  key: 'type',
                  match: { value: 'customer' }
                },
                {
                  key: 'zip',
                  match: { value: zipCode }
                }
              ]
            }
          });

          if (zipResult.length > 0) {
            const customer = zipResult[0];
            return NextResponse.json({
              success: true,
              data: {
                name: customer.payload?.name as string || 'Unknown Customer',
                zip: customer.payload?.zip as string || zipCode,
                loanAmount: customer.payload?.loanAmount as number || 0,
                daysLate: customer.payload?.daysLate as number || 0,
                balance: customer.payload?.balance as number || 0,
                paymentCapacity: customer.payload?.paymentCapacity as string || 'unknown',
                riskLevel: customer.payload?.riskLevel as string || 'unknown',
                reason: customer.payload?.reason as string || 'unknown',
              },
            });
          }
        } catch (qdrantError) {
          console.log('Qdrant connection failed, using mock data:', qdrantError);
        }

        // Fallback to mock data if Qdrant fails or no results found
        const mockCustomers = [
          {
            name: 'Sarah Mitchell',
            zip: '90210',
            loanAmount: 15000,
            daysLate: 45,
            balance: 12500,
            paymentCapacity: 'moderate',
            riskLevel: 'medium',
            reason: 'temporary job loss'
          },
          {
            name: 'James Rodriguez',
            zip: '10001',
            loanAmount: 25000,
            daysLate: 60,
            balance: 22000,
            paymentCapacity: 'low',
            riskLevel: 'high',
            reason: 'medical expenses'
          },
          {
            name: 'Patricia Chen',
            zip: '60601',
            loanAmount: 8000,
            daysLate: 30,
            balance: 7200,
            paymentCapacity: 'high',
            riskLevel: 'low',
            reason: 'temporary cash flow issue'
          },
          {
            name: 'Michael Thompson',
            zip: '94101',
            loanAmount: 20000,
            daysLate: 35,
            balance: 18500,
            paymentCapacity: 'moderate',
            riskLevel: 'medium',
            reason: 'business downturn'
          }
        ];

        const mockCustomer = mockCustomers.find(c => c.zip === zipCode) || {
          name: 'Generic Customer',
          zip: zipCode,
          loanAmount: 10000,
          daysLate: 30,
          balance: 9000,
          paymentCapacity: 'moderate',
          riskLevel: 'medium',
          reason: 'financial hardship'
        };
        
        return NextResponse.json({
          success: true,
          data: mockCustomer,
        });

      case 'getCustomerById':
        const idResult = await qdrantClient.search(COLLECTION_NAME, {
          vector: generateEmbedding(`customer id ${customerId}`),
          limit: 1,
          with_payload: true,
          filter: {
            must: [
              {
                key: 'type',
                match: { value: 'customer' }
              },
              {
                key: 'customerId',
                match: { value: customerId }
              }
            ]
          }
        });

        if (idResult.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Customer not found',
          });
        }

        const customerById = idResult[0];
        return NextResponse.json({
          success: true,
          data: {
            name: customerById.payload?.name as string || 'Unknown Customer',
            zip: customerById.payload?.zip as string || '',
            loanAmount: customerById.payload?.loanAmount as number || 0,
            daysLate: customerById.payload?.daysLate as number || 0,
            balance: customerById.payload?.balance as number || 0,
            paymentCapacity: customerById.payload?.paymentCapacity as string || 'unknown',
            riskLevel: customerById.payload?.riskLevel as string || 'unknown',
            reason: customerById.payload?.reason as string || 'unknown',
          },
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid request type',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Qdrant API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}