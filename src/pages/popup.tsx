import React from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import Browser from 'webextension-polyfill';
import Link from '../components/Link';
import LogoLink from '../components/LogoLink';
import Settings from '../components/Settings';
import '../i18n/config';
import '../styles.css';

const Popup = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 items-center p-4 w-[280px]">
      <div className="w-[200px]">
        <img className="w-[200px]" src="/images/revoke.svg" alt="revoke.cash logo" width="200" />
      </div>
      <Settings />
      <div className="flex flex-wrap justify-center items-center gap-2">
        <LogoLink
          src="/images/vendor/github.png"
          alt="Source Code"
          href="https://github.com/RevokeCash/browser-extension"
        />
        <LogoLink src="/images/vendor/twitter.png" alt="Official Twitter" href="https://twitter.com/RevokeCash" />
        <LogoLink src="/images/vendor/discord.png" alt="Official Discord" href="https://discord.gg/revoke-cash" />
      </div>
      <div className="flex flex-col items-center">
        <Link href="https://revoke.cash">Revoke.cash</Link>
        <div>
          {t('popup.version')} {Browser.runtime.getManifest().version}
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
);
