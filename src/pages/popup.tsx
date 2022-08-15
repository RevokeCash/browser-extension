import React from 'react';
import ReactDOM from 'react-dom';
import Browser from 'webextension-polyfill';
import LogoLink from '../components/LogoLink';
import Settings from '../components/Settings';
import '../styles.css';

const Popup = () => {
  return (
    <div className="flex flex-col gap-3 items-center p-4 h-[220px] w-[280px]">
      <div className="w-[150px]">
        <img className="w-[150px]" src="/images/revoke.svg" alt="revoke.cash logo" width="150" />
      </div>
      <Settings />
      <div className="flex flex-wrap justify-center items-center gap-2">
        <LogoLink src="/images/vendor/github.png" alt="Source Code" href="https://github.com/RevokeCash/browser-extension" />
        <LogoLink src="/images/vendor/twitter.png" alt="Official Twitter" href="https://twitter.com/RevokeCash" />
      </div>
      <div>Version {Browser.runtime.getManifest().version}</div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
);
