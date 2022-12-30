import React from 'react';
import ReactDOM from 'react-dom';
import Browser from 'webextension-polyfill';
import Header from '../components/common/Header';
import Href from '../components/common/Href';
import LogoLink from '../components/common/LogoLink';
import LanguageSelect from '../components/popup/LanguageSelect';
import Settings from '../components/popup/Settings';
import { useTranslation } from '../i18n';
import { Urls } from '../lib/constants';
import '../styles.css';

const Popup = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 items-center p-4 w-[280px]">
      <Header size="small" />
      <Settings />
      <div className="flex flex-wrap justify-center items-center gap-2">
        <LogoLink src="/images/vendor/github.png" alt="Source Code" href={Urls.GITHUB} />
        <LogoLink src="/images/vendor/twitter.png" alt="Official Twitter" href={Urls.TWITTER} />
        <LogoLink src="/images/vendor/discord.png" alt="Official Discord" href={Urls.DISCORD} />
        <LanguageSelect />
      </div>
      <div className="flex flex-col items-center">
        <Href underline="always" href={Urls.REVOKE_CASH}>
          Revoke.cash
        </Href>
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
