'use client';

import { useState } from 'react';
import { contractsApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function MockContractButton({
  contractLabel,
  details,
}: {
  contractLabel: string;
  details: Record<string, any>;
}) {
  const [loading, setLoading] = useState(false);

  const fetchRealContract = async () => {
    setLoading(true);
    try {
      // First try to get it
      let contractData;
      try {
        const res = await contractsApi.getByOrder(details.id);
        contractData = res.data;
      } catch {
        // If not found, generate it
        const genRes = await contractsApi.generate(details.id);
        contractData = genRes.data;
      }
      
      if (contractData && contractData.pdfUrl) {
        toast.success('Contract retrieved!');
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const serverUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
        window.open(`${serverUrl}${contractData.pdfUrl}`, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Contract PDF not ready yet');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to fetch contract');
    } finally {
      setLoading(false);
    }
  };

  if (details.status !== 'delivered' && details.status !== 'accepted' && details.status !== 'shipped') {
    return null; // Only show for orders that are progressing
  }

  return (
    <button 
      type="button" 
      onClick={fetchRealContract} 
      disabled={loading}
      className="btn btn-outline"
    >
      {loading ? 'Processing...' : contractLabel}
    </button>
  );
}
