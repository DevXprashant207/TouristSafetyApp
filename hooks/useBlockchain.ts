import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '@/services/apiClient';
import { generateBlockchainId } from '@/utils/blockchain';

export function useBlockchain() {
  const { user } = useAuth();
  const [blockchainId, setBlockchainId] = useState<string | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);

  // Generate blockchain ID when user is available
  useEffect(() => {
    if (user && !blockchainId) {
      const id = generateBlockchainId(user);
      setBlockchainId(id);
    }
  }, [user, blockchainId]);

  const issueToBlockchain = async (): Promise<string> => {
    if (!blockchainId) {
      throw new Error('Blockchain ID not available');
    }

    setIsIssuing(true);
    try {
      const response = await apiClient.post<{ transactionHash: string }>('/blockchain/issue', {
        blockchainId,
        userInfo: {
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
        },
        metadata: {
          issuedAt: new Date().toISOString(),
          version: '1.0',
        },
      });

      return response.transactionHash;
    } catch (error) {
      console.error('Failed to issue to blockchain:', error);
      throw error;
    } finally {
      setIsIssuing(false);
    }
  };

  return {
    blockchainId,
    isIssuing,
    issueToBlockchain,
  };
}