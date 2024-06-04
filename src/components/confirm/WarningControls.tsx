import React from 'react';
import { Hash } from 'viem';
import Browser from 'webextension-polyfill';
import { useTranslations } from '../../i18n';
import MenuItem from '../common/MenuItem';
import Title from '../common/Title';

interface Props {
  requestId: Hash;
  bypassed: boolean;
}

const WarningControls = ({ bypassed, requestId }: Props) => {
  const t = useTranslations();

  const respond = async (data: boolean) => {
    try {
      await Browser.runtime.sendMessage(undefined, { requestId, data });
    } finally {
      window.close();
    }
  };

  const confirm = () => respond(true);
  const reject = () => respond(false);
  const dismiss = () => window.close();

  return (
    <div className="flex w-full h-16 divide-x divide-neutral-50 dark:divide-neutral-750 mt-3">
      {bypassed ? (
        <WarningControlsButton onClick={dismiss}>{t('common.dismiss')}</WarningControlsButton>
      ) : (
        <>
          <WarningControlsButton onClick={reject}>{t('common.reject')}</WarningControlsButton>
          <WarningControlsButton onClick={confirm}>{t('common.continue')}</WarningControlsButton>
        </>
      )}
    </div>
  );
};

export default WarningControls;

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

const WarningControlsButton = ({ children, onClick }: ButtonProps) => {
  return (
    <button onClick={onClick} className="grow">
      <MenuItem
        size="small"
        className="bg-neutral-100 dark:bg-neutral-800 hover:text-neutral-850 hover:dark:text-neutral-300 h-full w-full hover:bg-neutral-0 hover:dark:bg-neutral-750 justify-center"
      >
        <Title>{children}</Title>
      </MenuItem>
    </button>
  );
};
