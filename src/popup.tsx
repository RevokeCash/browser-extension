import React from "react";
import ReactDOM from "react-dom";
import Browser from 'webextension-polyfill';
import LogoLink from './components/LogoLink';
import './styles.css';

const Popup = () => {

  return (
    <div className="flex flex-col gap-3 items-center p-4">
      <div className="w-[150px]">
        <img className="w-[150px] shrink-0" src="/revoke.svg" alt="revoke.cash logo" width="150" />
      </div>
      <div className="flex flex-wrap justify-center items-center gap-2">
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
