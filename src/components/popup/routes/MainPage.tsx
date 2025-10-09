import React, { useEffect, useState } from 'react';
import TopBar from '../ui/TopBar';
import UpdateBanner from '../ui/UpdateBanner';
import Tabs from '../ui/Tabs';
import DomainBar from '../ui/DomainBar';
import FeatureCard from '../ui/FeatureCard';
import SettingsPanel from '../ui/SettingsPanel';
import FeeDetailsModal from '../ui/FeeDetailsModal';

const MainPage = () => {
  const [activeTab, setActiveTab] = useState<'features' | 'approvals' | 'settings'>('features');
  const [feeOpen, setFeeOpen] = useState(false);

  const openFee = () => setFeeOpen(true);
  const closeFee = () => setFeeOpen(false);

  const [domain, setDomain] = useState('');

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = new URL(tabs[0].url || '');
      setDomain(url.hostname);
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0B0B0B] text-[#EDEDED]">
      <TopBar />

      <UpdateBanner />

      <Tabs active={activeTab} onChange={setActiveTab} />

      <div className="px-3">
        <DomainBar domain={domain} />
      </div>

      <div className="flex-1 overflow-auto px-3 pb-3">
        {activeTab === 'features' && <FeatureCard onFeeDetails={openFee} />}
        {activeTab === 'approvals' && (
          <div className="text-sm text-neutral-400 p-3 border border-[#1E1E1E] rounded-xl bg-[#0E0E0E]">
            Approvals UI goes here.
          </div>
        )}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>

      {/* Modal */}
      <FeeDetailsModal open={feeOpen} onClose={closeFee} onGotIt={closeFee} />
    </div>
  );
};

export default MainPage;
