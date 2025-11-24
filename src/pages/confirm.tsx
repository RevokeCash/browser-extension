import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Browser from 'webextension-polyfill';
import Page from '../components/Page';
import Error from '../components/confirm/Error';
import Header from '../components/confirm/Header';
import Hostname from '../components/confirm/Hostname';
import WarningControls from '../components/confirm/WarningControls';
import BypassWarning from '../components/confirm/common/BypassWarning';
import DataContainer from '../components/confirm/common/DataContainer';
import WarningTypeTitle from '../components/confirm/common/WarningTypeTitle';
import AllowanceData from '../components/confirm/warning-types/allowance/AllowanceData';
import HashSignatureData from '../components/confirm/warning-types/hash/HashSignatureData';
import MarketplaceListingData from '../components/confirm/warning-types/listing/MarketplaceListingData';
import SuspectedScamData from '../components/confirm/warning-types/suspected-scam/SuspectedScamData';
import SimulationCard from '../components/confirm/tenderly/SimulationCard'; // <-- NEW
import { WarningType, FEATURE_KEYS } from '../lib/constants';
import { decodeWarningData } from '../lib/utils/decode';
import '../styles.css';
import { IntlProvider } from '../i18n';

const Confirm = () => {
  const params = new URLSearchParams(window.location.search);
  const data = decodeWarningData(params);
  const chainId = data?.type !== WarningType.HASH ? data?.chainId : undefined;

  const tenderlySummaryParam = params.get('tenderlySummary');
  const tenderlySummary = tenderlySummaryParam ? JSON.parse(tenderlySummaryParam) : null;

  const requestIdFromQuery = params.get('requestId') || data?.requestId;

  // Read slow mode setting from storage
  const [slowMode, setSlowMode] = useState(null);
  useEffect(() => {
    Browser.storage.local.get(FEATURE_KEYS.SLOWMODE).then((result) => {
      setSlowMode(result[FEATURE_KEYS.SLOWMODE] ?? false);
    });
  }, []);

  if (!data && !tenderlySummary) {
    return (
      <Page>
        <Error />
      </Page>
    );
  }

  // Render both when available; otherwise render whichever exists
  return (
    <Page>
      <div className="flex flex-col justify-start items-stretch w-full h-screen bg-black text-white divide-y divide-neutral-800">
        <Header size="large" chainId={chainId} />
        {data?.hostname && <Hostname hostname={data.hostname} />}

        <DataContainer className="bg-black">
          {data && (
            <>
              <WarningTypeTitle type={data.type} />
              {data.type === WarningType.ALLOWANCE && <AllowanceData data={data} />}
              {data.type === WarningType.LISTING && <MarketplaceListingData data={data} />}
              {data.type === WarningType.SUSPECTED_SCAM && <SuspectedScamData data={data} />}
              {data.type === WarningType.HASH && <HashSignatureData data={data} />}
              {data.bypassed && <BypassWarning />}
            </>
          )}

          {/* Simulation block (if any) */}
          {tenderlySummary && (
            <div style={{ width: '100%' }}>
              <SimulationCard data={tenderlySummary} className="max-w-none bg-neutral-900 border-neutral-800" />
            </div>
          )}
        </DataContainer>

        <WarningControls bypassed={!!data?.bypassed} requestId={requestIdFromQuery as any} slowMode={slowMode} />
      </div>
    </Page>
  );
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <IntlProvider>
      <Confirm />
    </IntlProvider>
  </React.StrictMode>,
);
