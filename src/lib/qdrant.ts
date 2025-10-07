// Client-side Qdrant service that uses API routes to avoid browser connection issues

export interface LoanDocument {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface CustomerData {
  name: string;
  zip: string;
  loanAmount: number;
  daysLate: number;
  balance: number;
  paymentCapacity: 'low' | 'moderate' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
}

export interface ConversationContext {
  suggestedApproach: string;
  keyTalkingPoints: string[];
  riskFactors: string[];
  recommendedPaymentPlan: string;
}

/**
 * Search for relevant loan documents based on query
 */
export async function searchLoanDocuments(query: string): Promise<LoanDocument[]> {
  try {
    const response = await fetch('/api/qdrant/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'searchDocuments',
        query,
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to search documents');
    }

    return result.data;
  } catch (error) {
    console.error('Error searching loan documents:', error);
    throw error;
  }
}

/**
 * Get customer data by ZIP code
 */
export async function getCustomerByZip(zipCode: string): Promise<CustomerData | null> {
  try {
    const response = await fetch('/api/qdrant/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'getCustomerByZip',
        zipCode,
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Error getting customer by ZIP:', error);
    return null;
  }
}

/**
 * Get customer data by customer ID
 */
export async function getCustomerById(customerId: string): Promise<CustomerData | null> {
  try {
    const response = await fetch('/api/qdrant/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'getCustomerById',
        customerId,
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Error getting customer by ID:', error);
    return null;
  }
}

/**
 * Generate conversation context based on customer data
 */
export function generateConversationContext(customer: CustomerData): ConversationContext {
  const { paymentCapacity, riskLevel, daysLate, reason, balance } = customer;
  
  let suggestedApproach = '';
  let keyTalkingPoints: string[] = [];
  const riskFactors: string[] = [];
  let recommendedPaymentPlan = '';

  // Determine approach based on risk level and payment capacity
  if (riskLevel === 'low' && paymentCapacity === 'high') {
    suggestedApproach = 'Collaborative and solution-focused';
    keyTalkingPoints = [
      'Acknowledge their good payment history',
      'Focus on resolving the temporary issue',
      'Offer flexible payment options',
      'Emphasize maintaining their good standing'
    ];
    recommendedPaymentPlan = 'Full payment or short-term payment plan';
  } else if (riskLevel === 'medium') {
    suggestedApproach = 'Empathetic but firm';
    keyTalkingPoints = [
      'Show understanding of their situation',
      'Explain consequences of continued delinquency',
      'Present clear payment options',
      'Set specific follow-up dates'
    ];
    recommendedPaymentPlan = '3-6 month payment plan with regular check-ins';
  } else {
    suggestedApproach = 'Urgent but supportive';
    keyTalkingPoints = [
      'Express urgency of the situation',
      'Explore all possible payment sources',
      'Discuss hardship programs if available',
      'Set immediate next steps'
    ];
    recommendedPaymentPlan = 'Extended payment plan or hardship program';
  }

  // Add risk factors based on customer situation
  if (daysLate > 60) {
    riskFactors.push('Account significantly past due');
  }
  if (paymentCapacity === 'low') {
    riskFactors.push('Limited payment capacity');
  }
  if (balance > 20000) {
    riskFactors.push('High outstanding balance');
  }
  if (reason.includes('job') || reason.includes('employment')) {
    riskFactors.push('Employment-related financial stress');
  }

  return {
    suggestedApproach,
    keyTalkingPoints,
    riskFactors,
    recommendedPaymentPlan,
  };
}