import React from 'react';
import { createRoot } from 'react-dom/client';
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
import { WarningType } from '../lib/constants';
import { decodeWarningData } from '../lib/utils/decode';
import '../styles.css';

const Confirm = () => {
  const data = decodeWarningData(new URLSearchParams(window.location.search));
  const chainId = data?.type !== WarningType.HASH ? data?.chainId : undefined;

  // Display an error message when no data could be decoded
  if (!data) {
    return (
      <Page>
        <Error />
      </Page>
    );
  }

  return (
    <Page>
      <div className="flex flex-col justify-start items-stretch w-full h-screen divide-y divide-neutral-50 dark:divide-neutral-750 bg-neutral-100 dark:bg-neutral-800">
        <Header size="large" chainId={chainId} />
        <Hostname hostname={data.hostname} />
        <DataContainer>
          <WarningTypeTitle type={data.type} />
          {data.type === WarningType.ALLOWANCE && <AllowanceData data={data} />}
          {data.type === WarningType.LISTING && <MarketplaceListingData data={data} />}
          {data.type === WarningType.SUSPECTED_SCAM && <SuspectedScamData data={data} />}
          {data.type === WarningType.HASH && <HashSignatureData data={data} />}
          {data.bypassed && <BypassWarning />}
        </DataContainer>
        <WarningControls bypassed={data.bypassed} requestId={data.requestId} />
        <div />
      </div>
    </Page>
  );
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Confirm />
  </React.StrictMode>
);
