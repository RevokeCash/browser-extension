import React from 'react';
import { useTranslations } from '../../../i18n';
import Browser from 'webextension-polyfill';
import { Urls } from '../../../lib/constants';
import ExternalLink from '../../common/ExternalLink';
import KeyValue from '../../common/KeyValue';
import MenuItem from '../../common/MenuItem';
import SettingsPage from '../settings/SettingsPage';

const AboutPage = () => {
  const t = useTranslations();

  return (
    <SettingsPage title={t('popup.about.title')}>
      <MenuItem size="large">
        <KeyValue>
          <div>{t('popup.about.version')}</div>
          <div>{Browser.runtime.getManifest().version}</div>
        </KeyValue>
      </MenuItem>
      <ExternalLink size="large" colorChangeOnHover href={Urls.REVOKE_CASH}>
        {t('popup.about.official_website')}
      </ExternalLink>
      <ExternalLink size="large" colorChangeOnHover href={Urls.GITHUB}>
        {t('popup.about.links.github')}
      </ExternalLink>
      <ExternalLink size="large" colorChangeOnHover href={Urls.X}>
        {t('popup.about.links.x')}
      </ExternalLink>
      <ExternalLink size="large" colorChangeOnHover href={Urls.DISCORD}>
        {t('popup.about.links.discord')}
      </ExternalLink>
    </SettingsPage>
  );
};

export default AboutPage;
