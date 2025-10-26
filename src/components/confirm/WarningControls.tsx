import React from 'react';
import { Hash } from 'viem';
import Browser from 'webextension-polyfill';
import MenuItem from '../common/MenuItem';
import Title from '../common/Title';

interface Props {
  requestId: Hash;
  bypassed: boolean;
}

function readQuery() {
  try {
    const p = new URLSearchParams(window.location.search);
    const warningData = p.get('warningData') ? JSON.parse(p.get('warningData')!) : null;
    const tenderlySummary = p.get('tenderlySummary') ? JSON.parse(p.get('tenderlySummary')!) : null;
    return { warningData, tenderlySummary };
  } catch {
    return { warningData: null, tenderlySummary: null };
  }
}

const WarningControls = ({ bypassed, requestId }: Props) => {
  const { warningData, tenderlySummary } = React.useMemo(readQuery, []);

  const logPopupEvent = async (approved: boolean) => {
    try {
      const userAddress: string | undefined =
        warningData?.address ??
        warningData?.spender ??
        tenderlySummary?.transaction?.from ??
        tenderlySummary?.from ??
        undefined;

      const simulationSummary = tenderlySummary
        ? {
            estimatedGas: tenderlySummary?.simulation?.gas ?? tenderlySummary?.gas ?? undefined,
            changes: tenderlySummary?.balance_diff
              ? Object.entries(tenderlySummary.balance_diff).map(([token, delta]: any) => ({
                  token,
                  delta: String(delta),
                }))
              : undefined,
            risks: warningData?.type ? [String(warningData.type)] : undefined,
          }
        : undefined;

      const metadata = {
        url: warningData?.hostname ? `https://${warningData.hostname}` : undefined,
        simulationSummary,
        reason: approved ? undefined : 'User rejected in popup',
      };

      await Browser.runtime.sendMessage(undefined, {
        __fs_event__: true,
        kind: approved ? 'popupOK' : 'popupNOK',
        userAddress,
        metadata,
      });
    } catch {}
  };

  const respond = async (data: boolean) => {
    try {
      await logPopupEvent(!!data);
    } finally {
      try {
        await Browser.runtime.sendMessage(undefined, { requestId, data });
      } finally {
        window.close();
      }
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
