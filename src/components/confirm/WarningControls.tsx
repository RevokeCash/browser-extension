import React from 'react';
import { Hash } from 'viem';
import Browser from 'webextension-polyfill';
import MenuItem from '../common/MenuItem';
import Title from '../common/Title';

interface Props {
  requestId: Hash;
  bypassed: boolean;
}

const WarningControls = ({ bypassed, requestId }: Props) => {
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
    <div className="flex w-full h-16 divide-x divide-neutral-800 mt-3 shrink-0 bg-neutral-950">
      {bypassed ? (
        <WarningControlsButton onClick={dismiss}>Dismiss</WarningControlsButton>
      ) : (
        <>
          <WarningControlsButton onClick={reject}>Reject</WarningControlsButton>
          <WarningControlsButton onClick={confirm}>Continue</WarningControlsButton>
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
        className="
          bg-neutral-900 
          text-neutral-200 
          hover:text-white 
          hover:bg-neutral-800 
          h-full w-full 
          justify-center 
          transition-colors duration-150
          border border-neutral-800
        "
      >
        <Title>{children}</Title>
      </MenuItem>
    </button>
  );
};
