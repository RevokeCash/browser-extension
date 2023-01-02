import React from 'react';
import Browser from 'webextension-polyfill';
import { useTranslation } from '../../i18n';
import { Urls } from '../../lib/constants';
import Href from '../common/Href';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="flex flex-col items-center">
        <div className="flex flex-wrap justify-center items-center gap-2">
          <Href underline="hover" href={Urls.GITHUB}>
            GitHub
          </Href>
          <Href underline="hover" href={Urls.TWITTER}>
            Twitter
          </Href>
          <Href underline="hover" href={Urls.DISCORD}>
            Discord
          </Href>
        </div>
        <Href underline="hover" href={Urls.REVOKE_CASH}>
          Revoke.cash
        </Href>
        <div>
          {t('popup.version')} {Browser.runtime.getManifest().version}
        </div>
      </div>
    </div>
  );
};

export default Footer;
