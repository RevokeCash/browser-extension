import React from 'react';
import ReactDOM from 'react-dom';
import Browser from 'webextension-polyfill';
import Button from '../components/Button';
import '../styles.css';

const ConfirmHashSignature = () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const bypassed = params.get('bypassed') === 'true';
  const hostname = params.get('hostname');

  const respond = async (data: boolean) => {
    await Browser.runtime.sendMessage(undefined, { id, data });
    window.close();
  };

  const confirm = () => respond(true);
  const reject = () => respond(false);

  return (
    <div className="flex flex-col gap-1 justify-center items-center w-full h-screen p-2">
      <div className="w-[360px]">
        <img src="/images/revoke.svg" alt="revoke.cash logo" width="360" />
      </div>
      {bypassed ? (
        <div className="w-[380px] text-center">
          <span className="font-bold">WARNING</span>: This website bypassed the Revoke.cash confirmation process and is{' '}
          asking you to sign a hash on <span className="font-bold">{hostname}</span>! This can be used to list NFTs for
          sale or authorize asset transfers. Please make sure you trust this website.
        </div>
      ) : (
        <div className="w-[380px] text-center">
          You are about to sign a hash on <span className="font-bold">{hostname}</span>! This can potentially be used to
          list NFTs for sale or transfer assets. Please make sure you trust this website.
        </div>
      )}
      {bypassed ? (
        <div className="flex gap-1 pt-2">
          <Button onClick={() => window.close()}>Dismiss</Button>
        </div>
      ) : (
        <div className="flex gap-1 pt-2">
          <Button onClick={reject} secondary>
            Reject
          </Button>
          <Button onClick={confirm}>Continue</Button>
        </div>
      )}
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <ConfirmHashSignature />
  </React.StrictMode>,
  document.getElementById('root')
);
