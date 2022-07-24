import React from "react";
import ReactDOM from "react-dom";
import Browser from 'webextension-polyfill';
import { getExplorerUrl } from './utils';
import './styles.css';
import Button from './components/Button';
import Link from './components/Link';

const Confirm = () => {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  const asset = params.get('asset');
  const chainId = Number(params.get('chainId'));
  const spender = params.get('spender');
  const name = params.get('name');
  const symbol = params.get('symbol');
  const spenderName = params.get('spenderName');
  const explorerUrl = getExplorerUrl(chainId);
  console.log(params.toString());

  const respond = async (data: boolean) => {
    await Browser.runtime.sendMessage(undefined, { id, data })
    window.close();
  };

  const confirm = () => respond(true);
  const reject = () => respond(false);

  const assetString = name && symbol ? `${name} (${symbol})` : name || symbol || asset;

  return (
    <div className="flex flex-col gap-1 items-center p-2">
      <div className="w-[300px]">
        <img src="/revoke.svg" alt="revoke.cash logo" width="300" />
      </div>
      <div>You are about to approve an allowance!</div>
      <div>Please make sure this is your intention.</div>
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">Asset</div>
        <div>
          <Link href={`${explorerUrl}/address/${asset}`}>{assetString}</Link>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="font-bold text-lg leading-tight">Spender</div>
        <div>
        <Link href={`${explorerUrl}/address/${spender}`}>{spenderName || spender}</Link>
        </div>
      </div>
      <div className="flex gap-1 pt-2">
        <Button onClick={confirm}>Continue</Button>
        <Button onClick={reject}>Reject</Button>
      </div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Confirm />
  </React.StrictMode>,
  document.getElementById("root")
);
