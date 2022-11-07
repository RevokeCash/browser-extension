import React from 'react';
import ReactDOM from 'react-dom';
import { Trans } from 'react-i18next';
import AllowanceInfo from '../components/AllowanceInfo';
import Header from '../components/Header';
import Link from '../components/Link';
import ListingInfo from '../components/ListingInfo';
import WarningControls from '../components/WarningControls';
import WarningText from '../components/WarningText';
import { Urls, WarningType } from '../lib/constants';
import { decodeWarningData } from '../lib/utils/decode';
import '../styles.css';

const Confirm = () => {
  const data = decodeWarningData(new URLSearchParams(window.location.search));

  // Display an error message when no data could be decoded
  if (!data) {
    return (
      <div className="flex flex-col gap-1 justify-center items-center w-full h-screen p-2">
        <Header size="large" />
        <div className="w-[400px] text-center">
          <Trans i18nKey="common.error_occurred" components={[<Link href={Urls.DISCORD} />]} />
        </div>
        <WarningControls bypassed={true} requestId={'placeholder'} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 justify-center items-center w-full h-screen p-2">
      <Header size="large" />
      <WarningText type={WarningType.ALLOWANCE} bypassed={data.bypassed} hostname={data.hostname} />
      {data.type === WarningType.ALLOWANCE && <AllowanceInfo data={data} />}
      {data.type === WarningType.LISTING && <ListingInfo data={data} />}
      <WarningControls bypassed={data.bypassed} requestId={data.requestId} />
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Confirm />
  </React.StrictMode>,
  document.getElementById('root')
);
