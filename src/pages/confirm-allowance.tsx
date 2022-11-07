import React from 'react';
import ReactDOM from 'react-dom';
import AllowanceInfo from '../components/AllowanceInfo';
import Header from '../components/Header';
import WarningControls from '../components/WarningControls';
import '../styles.css';

const ConfirmAllowance = () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id')!;
  const asset = params.get('asset')!;
  const chainId = Number(params.get('chainId'));
  const spender = params.get('spender')!;
  const bypassed = params.get('bypassed') === 'true';
  const hostname = params.get('hostname')!;

  return (
    <div className="flex flex-col gap-1 justify-center items-center w-full h-screen p-2">
      <Header size="large" />
      <AllowanceInfo data={{ chainId, asset, spender, bypassed, hostname }} />
      <WarningControls bypassed={bypassed} requestId={id} />
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <ConfirmAllowance />
  </React.StrictMode>,
  document.getElementById('root')
);
