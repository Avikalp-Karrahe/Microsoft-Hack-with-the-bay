import { useState, useCallback } from 'react';
import { 
  searchLoanDocuments, 
  getCustomerByZip, 
  getCustomerById, 
  generateConversationContext,
  type CustomerData,
  type LoanDocument,
  type ConversationContext
} from '@/lib/qdrant';

export interface UseQdrantReturn {
  // State
  isLoading: boolean;
  error: string | null;
  customerData: CustomerData | null;
  conversationContext: ConversationContext | null;
  
  // Actions
  searchCustomerByZip: (zipCode: string) => Promise<CustomerData | null>;
  searchCustomerById: (customerId: string) => Promise<CustomerData | null>;
  searchDocuments: (query: string) => Promise<LoanDocument[]>;
  generateContext: (customer: CustomerData) => Promise<ConversationContext | null>;
  clearData: () => void;
  clearError: () => void;
}

export const useQdrant = (): UseQdrantReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setCustomerData(null);
    setConversationContext(null);
    setError(null);
  }, []);

  const searchCustomerByZip = useCallback(async (zipCode: string): Promise<CustomerData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const customer = await getCustomerByZip(zipCode);
      setCustomerData(customer);
      return customer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search customer by ZIP';
      setError(errorMessage);
      console.error('Error searching customer by ZIP:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchCustomerById = useCallback(async (customerId: string): Promise<CustomerData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const customer = await getCustomerById(customerId);
      setCustomerData(customer);
      return customer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search customer by ID';
      setError(errorMessage);
      console.error('Error searching customer by ID:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchDocuments = useCallback(async (
    query: string
  ): Promise<LoanDocument[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const documents = await searchLoanDocuments(query);
      return documents;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search documents';
      setError(errorMessage);
      console.error('Error searching documents:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateContext = useCallback(async (
    customer: CustomerData
  ): Promise<ConversationContext | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const context = generateConversationContext(customer);
      setConversationContext(context);
      return context;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate conversation context';
      setError(errorMessage);
      console.error('Error generating conversation context:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    customerData,
    conversationContext,
    
    // Actions
    searchCustomerByZip,
    searchCustomerById,
    searchDocuments,
    generateContext,
    clearData,
    clearError,
  };
};