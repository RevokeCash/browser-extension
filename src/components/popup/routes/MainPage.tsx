import React, { useState } from 'react';
import TopBar from '../ui/TopBar';
import UpdateBanner from '../ui/UpdateBanner';
import Tabs from '../ui/Tabs';
import DomainBar from '../ui/DomainBar';
import FeatureCard from '../ui/FeatureCard';
import SettingsPanel from '../ui/SettingsPanel';
import FeeDetailsModal from '../ui/FeeDetailsModal';
import ApprovalsPanel from '../ui/ApprovalsPanel';
import pkg from '../../../../package.json';
import ClaimConsentModal from '../ui/ClaimConsentModal';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}
const FOOTER_SPACE_PX = 76;

const MainPage = () => {
  const [activeTab, setActiveTab] = useState<'features' | 'approvals' | 'settings'>('features');
  const [feeOpen, setFeeOpen] = useState(false);

  const openFee = () => setFeeOpen(true);
  const closeFee = () => setFeeOpen(false);

  const [claimOpen, setClaimOpen] = useState(false); // <-- new

  // When user clicks "File claim" inside FeeDetailsModal
  const startClaim = () => {
    setFeeOpen(false);
    setClaimOpen(true);
  };

  // What to do after user confirms the checkboxes
  const confirmClaim = () => {
    setClaimOpen(false);
    // TODO: route to your claim form page, or open another modal/screen:
    // e.g., navigate('/claim/start') or open ClaimFormModal
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0B0B0B] text-[#EDEDED]">
      <TopBar />
      <UpdateBanner versionId={`v${pkg.version}`} maxAgeDays={30} />

      <Tabs active={activeTab} onChange={setActiveTab} />

      <div className="px-3">
        <DomainBar />
      </div>

      <div
        className="flex-1 min-h-0 overflow-auto px-3"
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
      <FeeDetailsModal open={feeOpen} onClose={closeFee} onGotIt={closeFee} onFileClaim={startClaim} />
      <ClaimConsentModal open={claimOpen} onClose={() => setClaimOpen(false)} onConfirm={confirmClaim} />
    </div>
  );
};

export default MainPage;
