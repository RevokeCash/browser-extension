import React from 'react';
import { createRoot } from 'react-dom/client';
import Page from '../components/Page';
import Header from '../components/common/Header';
import AddressInfo from '../components/confirm/AddressInfo';
import AllowanceInfo from '../components/confirm/AllowanceInfo';
import Error from '../components/confirm/Error';
import ListingInfo from '../components/confirm/ListingInfo';
import WarningControls from '../components/confirm/WarningControls';
import WarningText from '../components/confirm/WarningText';
import { WarningType } from '../lib/constants';
import { decodeWarningData } from '../lib/utils/decode';
import '../styles.css';

const Confirm = () => {
  const data = decodeWarningData(new URLSearchParams(window.location.search));
  const platform = data?.type === WarningType.LISTING ? data.platform : undefined;
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
      <div className="flex flex-col gap-2 justify-center items-center w-full h-screen p-2">
        <Header size="large" chainId={chainId} />
        <WarningText type={data.type} bypassed={data.bypassed} hostname={data.hostname} platform={platform} />
        {data.type === WarningType.ALLOWANCE && <AllowanceInfo data={data} />}
        {data.type === WarningType.LISTING && <ListingInfo data={data} />}
        {data.type === WarningType.SUSPECTED_SCAM && <AddressInfo data={data} />}
        <WarningControls bypassed={data.bypassed} requestId={data.requestId} />
      </div>
    </Page>
  );
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Confirm />
  </React.StrictMode>
);
