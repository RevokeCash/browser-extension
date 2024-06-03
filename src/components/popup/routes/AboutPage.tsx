import React from 'react';
import { useTranslations } from 'use-intl';
import Browser from 'webextension-polyfill';
import { Urls } from '../../../lib/constants';
import ExternalLink from '../settings/ExternalLink';
import SettingsPage from '../settings/SettingsPage';
import ValueSetting from '../settings/ValueSetting';

const AboutPage = () => {
  const t = useTranslations();

  return (
    <SettingsPage title={t('popup.about.title')}>
      <div className="text-center p-4 font-medium">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy.
      </div>
      <ValueSetting label={t('popup.about.version')} value={Browser.runtime.getManifest().version} />
      <ExternalLink href={Urls.REVOKE_CASH} label={t('popup.about.official_website')} />
      <ExternalLink href={Urls.GITHUB} label="GitHub" />
      <ExternalLink href={Urls.TWITTER} label="X (Twitter)" />
      <ExternalLink href={Urls.DISCORD} label="Discord" />
    </SettingsPage>
  );
};

export default AboutPage;
