import React from "react";
import ReactDOM from "react-dom";
import Browser from 'webextension-polyfill';
import LogoLink from './components/LogoLink';

const Popup = () => {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <img className="logo" src="/revoke.svg" alt="revoke.cash logo" width="150" />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
        <LogoLink src="/logos/github.png" alt="Source Code" href="https://github.com/RevokeCash/revoke.cash" />
        <LogoLink src="/logos/twitter.png" alt="Official Twitter" href="https://twitter.com/RevokeCash" />
      </div>
      <div>
        Version {Browser.runtime.getManifest().version}
      </div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
