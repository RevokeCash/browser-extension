import React from "react";
import ReactDOM from "react-dom";
import Browser from 'webextension-polyfill';
import { getExplorerUrl } from './utils';

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

  const respond = async (data: boolean) => {
    await Browser.runtime.sendMessage(undefined, { id, data })
    window.close();
  };

  const confirm = () => respond(true);
  const reject = () => respond(false);

  const assetString = name && symbol ? `${name} (${symbol})` : name || symbol || asset;

  return (
    <>
      <div>You are about to set an allowance!</div>
      <div>Asset: <a href={`${explorerUrl}/address/${asset}`} target="_blank">{assetString}</a></div>
      <div>Spender: <a href={`${explorerUrl}/address/${spender}`} target="_blank">{spenderName || spender}</a></div>
      <button onClick={confirm}>Confirm</button>
      <button onClick={reject}>Reject</button>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Confirm />
  </React.StrictMode>,
  document.getElementById("root")
);
