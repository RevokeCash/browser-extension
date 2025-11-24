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
import Footer from '../ui/Footer';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}
const FOOTER_SPACE_PX = 76;

const MainPage = () => {
  const [activeTab, setActiveTab] = useState<'features' | 'approvals' | 'settings'>('approvals');
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

  const openWhatsNew = () => {
    try {
      const url = chrome.runtime.getURL('onboarding/index.html');
      chrome.tabs?.create({ url, active: true });
      // Close the popup after opening the onboarding tab
      window.close();
    } catch (_) {
      // ignore
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0B0B0B] text-[#EDEDED]">
      <TopBar />
      <UpdateBanner versionId={`v${pkg.version}`} maxAgeDays={30} onOpenWhatsNew={openWhatsNew} />

      <Tabs active={activeTab} onChange={setActiveTab} />

      <div className="px-3">
        <DomainBar
          showWarningOnlyWhenMalicious={activeTab === 'features' || activeTab === 'approvals'}
          onlyShowWhenMalicious={activeTab === 'features' || activeTab === 'approvals'}
        />
      </div>

      <div
        className="flex-1 min-h-0 overflow-auto px-3"
        style={{
          paddingBottom: activeTab === 'features' || activeTab === 'approvals' ? FOOTER_SPACE_PX : 12,
        }}
      >
        {activeTab === 'features' && <FeatureCard onFeeDetails={openFee} />}
        {activeTab === 'approvals' && <ApprovalsPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>

      {(activeTab === 'features' || activeTab === 'approvals') && (
        <Footer activeTab={activeTab} onCoverageClick={openFee} />
      )}

      {/* Modal */}
      <FeeDetailsModal open={feeOpen} onClose={closeFee} onGotIt={closeFee} onFileClaim={startClaim} />
      <ClaimConsentModal open={claimOpen} onClose={() => setClaimOpen(false)} onConfirm={confirmClaim} />
    </div>
  );
};

export default MainPage;
