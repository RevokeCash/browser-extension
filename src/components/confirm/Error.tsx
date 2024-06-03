import React from 'react';
import Header from '../../components/common/Header';
import WarningControls from '../../components/confirm/WarningControls';
import { useTranslations } from '../../i18n';

const Error = () => {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2 justify-center items-center w-full h-screen p-2">
      <Header size="large" />
      <div className="w-104 text-center">{t.rich('common.error_occurred')}</div>
      <WarningControls bypassed={true} requestId={'0xPlaceholder'} />
    </div>
  );
};

export default Error;
