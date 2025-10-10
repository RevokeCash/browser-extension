import React, { useState, useEffect } from 'react';
import TopBar from '../ui/TopBar';
import UpdateBanner from '../ui/UpdateBanner';
import Tabs from '../ui/Tabs';
import DomainBar from '../ui/DomainBar';
import FeatureCard from '../ui/FeatureCard';
import SettingsPanel from '../ui/SettingsPanel';
import FeeDetailsModal from '../ui/FeeDetailsModal';
import ApprovalsPanel from '../ui/ApprovalsPanel';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}

const MainPage = () => {
  const [activeTab, setActiveTab] = useState<'features' | 'approvals' | 'settings'>('features');
  const [feeOpen, setFeeOpen] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  const openFee = () => setFeeOpen(true);
  const closeFee = () => setFeeOpen(false);

  // Get connected wallet address
  useEffect(() => {
    const getConnectedAddress = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setConnectedAddress(accounts?.[0] || null);
        }
      } catch (error) {
        console.warn('Failed to get connected wallet address:', error);
      }
    };

    getConnectedAddress();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0B0B0B] text-[#EDEDED]">
      <TopBar status="ON" />

      <UpdateBanner />

      <Tabs active={activeTab} onChange={setActiveTab} />

      <div className="px-3">
        <DomainBar domain="app.uniswap.org" verified address={connectedAddress} />
      </div>

      <div className="flex-1 overflow-auto px-3 pb-3">
        {activeTab === 'features' && <FeatureCard onFeeDetails={openFee} />}
        {activeTab === 'approvals' && <ApprovalsPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>

      {/* Modal */}
      <FeeDetailsModal open={feeOpen} onClose={closeFee} onGotIt={closeFee} />
    </div>
  );
};

export default MainPage;
