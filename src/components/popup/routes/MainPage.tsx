import React, { useEffect, useState } from 'react';
import TopBar from '../ui/TopBar';
import UpdateBanner from '../ui/UpdateBanner';
import Tabs from '../ui/Tabs';
import DomainBar from '../ui/DomainBar';
import FeatureCard from '../ui/FeatureCard';
import SettingsPanel from '../ui/SettingsPanel';
import FeeDetailsModal from '../ui/FeeDetailsModal';
import ApprovalsPanel from '../ui/ApprovalsPanel';

const FOOTER_SPACE_PX = 76;

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
        <DomainBar />
      </div>

      <div
        className="flex-1 overflow-auto px-3"
        style={{ paddingBottom: activeTab === 'features' ? FOOTER_SPACE_PX : 12 }}
      >
        {activeTab === 'features' && <FeatureCard onFeeDetails={openFee} />}
        {activeTab === 'approvals' && <ApprovalsPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>

      {activeTab === 'features' && (
        <div className="fixed inset-x-0 bottom-0 z-20 px-3 pb-3 bg-[#0B0B0B]">
          <div className="rounded-[12px]  bg-[#0D0D0D] px-3 py-2 text-[12px] text-neutral-400">
            Wallet Drain Coverage adds 0.8% to covered transactions.{` `}
            <button onClick={openFee} className="underline text-neutral-300 hover:text-neutral-100 transition-colors">
              Coverage Benefits
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <FeeDetailsModal open={feeOpen} onClose={closeFee} onGotIt={closeFee} />
    </div>
  );
};

export default MainPage;
