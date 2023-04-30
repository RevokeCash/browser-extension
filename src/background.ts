import { init, track } from '@amplitude/analytics-browser';
import Browser from 'webextension-polyfill';
import { AddressAllowList, HostnameAllowList, warningSettingKeys, WarningType } from './lib/constants';
import { AggregateDecoder } from './lib/decoders/AggregateDecoder';
import { ApproveDecoder } from './lib/decoders/transaction/ApproveDecoder';
import { IncreaseAllowanceDecoder } from './lib/decoders/transaction/IncreaseAllowanceDecoder';
import { Permit2ApproveDecoder } from './lib/decoders/transaction/Permit2ApproveDecoder';
import { SetApprovalForAllDecoder } from './lib/decoders/transaction/SetApprovalForAllDecoder';
import { SuspectedScamDecoder } from './lib/decoders/transaction/SuspectedScamDecoder';
import { BlurBulkDecoder } from './lib/decoders/typed-signature/listing/BlurBulkDecoder';
import { BlurDecorder } from './lib/decoders/typed-signature/listing/BlurDecoder';
import { LooksRareDecoder } from './lib/decoders/typed-signature/listing/LooksRareDecoder';
import { Seaport14Decoder } from './lib/decoders/typed-signature/listing/Seaport14Decoder';
import { Seaport1Decoder } from './lib/decoders/typed-signature/listing/Seaport1Decoder';
import { BiconomyNativeDecoder } from './lib/decoders/typed-signature/metatransactions/BiconomyNativeDecoder';
import { GsnRelayDecoder } from './lib/decoders/typed-signature/metatransactions/GsnRelayDecoder';
import { Permit2BatchDecoder } from './lib/decoders/typed-signature/Permit2BatchDecoder';
import { Permit2SingleDecoder } from './lib/decoders/typed-signature/Permit2SingleDecoder';
import { PermitDecoder } from './lib/decoders/typed-signature/PermitDecoder';
import { PermitForAllDecoder } from './lib/decoders/typed-signature/PermitForAllDecoder';
import { HashDecoder } from './lib/decoders/untyped-signature/HashDecoder';
import { Message, MessageResponse, WarningData } from './lib/types';
import { randomId } from './lib/utils/misc';
import { getStorage, setStorage } from './lib/utils/storage';

// This is technically async, but it's safe to assume that this will complete before any tracking occurs
if (process.env.AMPLITUDE_API_KEY) {
  const initialiseAmplitude = async () => {
    const storedId = await getStorage<string>('sync', 'user:id');
    const userId = storedId ?? randomId();
    if (!storedId) await setStorage('sync', 'user:id', userId);
    init(process.env.AMPLITUDE_API_KEY!, userId, {
      trackingOptions: {
        ipAddress: false,
      },
    });
  };

  initialiseAmplitude();
}

// Note that these messages will be periodically cleared due to the background service shutting down
// after 5 minutes of inactivity (see Manifest v3 docs).
const messagePorts: { [index: string]: Browser.Runtime.Port } = {};
const approvedMessages: string[] = [];

const transactionDecoders = [
  new ApproveDecoder(),
  new IncreaseAllowanceDecoder(),
  new SetApprovalForAllDecoder(),
  new SuspectedScamDecoder(),
  new Permit2ApproveDecoder(),
];
const typedSignatureDecoders = [
  new PermitDecoder(),
  new PermitForAllDecoder(),
  new Permit2SingleDecoder(),
  new Permit2BatchDecoder(),
  new Seaport1Decoder(),
  new Seaport14Decoder(),
  new LooksRareDecoder(),
  new BlurDecorder(),
  new BlurBulkDecoder(),
  new GsnRelayDecoder(new AggregateDecoder(transactionDecoders, [], [])),
  new BiconomyNativeDecoder(new AggregateDecoder(transactionDecoders, [], [])),
];
const untypedSignatureDecoders = [new HashDecoder()];

const messageDecoder = new AggregateDecoder(transactionDecoders, typedSignatureDecoders, untypedSignatureDecoders);

const setupRemoteConnection = async (remotePort: Browser.Runtime.Port) => {
  remotePort.onMessage.addListener((message: Message) => {
    processMessage(message, remotePort);
  });
};

Browser.runtime.onConnect.addListener(setupRemoteConnection);

Browser.runtime.onMessage.addListener((response: MessageResponse) => {
  const responsePort = messagePorts[response.requestId];

  track('Responded to request', { requestId: response.requestId, response: response.data });

  if (response.data) {
    approvedMessages.push(response.requestId);
  }

  if (responsePort) {
    responsePort.postMessage(response);
    delete messagePorts[response.requestId];
    return;
  }
});

const processMessage = async (message: Message, remotePort: Browser.Runtime.Port) => {
  console.log('Processing message:', message);
  const popupCreated = await decodeMessageAndCreatePopupIfNeeded(message);

  // For bypassed messages we have no response to return
  if (message.data.bypassed) return;

  // If no popup was created, we respond positively to indicate that the request should go through
  if (!popupCreated) {
    remotePort.postMessage({ requestId: message.requestId, data: true });
    return;
  }

  // Store the remote port so the response can be sent back there
  messagePorts[message.requestId] = remotePort;
};

// Boolean result indicates whether a popup was created
const decodeMessageAndCreatePopupIfNeeded = async (message: Message): Promise<boolean> => {
  if (approvedMessages.includes(message.requestId)) return false;

  const warningData = messageDecoder.decode(message);
  if (!warningData) return false;

  const warningsTurnedOnForType = await getStorage('local', warningSettingKeys[warningData.type], true);
  if (!warningsTurnedOnForType) return false;

  const isHostnameAllowListed = HostnameAllowList[warningData.type].includes(warningData.hostname);
  if (isHostnameAllowListed) return false;

  const address = 'spender' in warningData ? warningData.spender : 'address' in warningData ? warningData.address : '';
  const isAddressAllowListed = AddressAllowList[warningData.type].includes(address.toLowerCase());
  if (isAddressAllowListed) return false;

  createWarningPopup(warningData);
  trackWarning(warningData);

  return true;
};

const trackWarning = (warningData: WarningData) => {
  if (warningData.type === WarningType.ALLOWANCE) {
    const { requestId, chainId, hostname, bypassed, user, assets, spender } = warningData;
    const allowance = { user, assets, spender };
    track('Allowance requested', { requestId, chainId, hostname, bypassed, allowance });
  } else if (warningData.type === WarningType.LISTING) {
    const { requestId, chainId, hostname, bypassed, platform, listing } = warningData;
    track('NFT listing requested', { requestId, chainId, hostname, bypassed, platform, listing });
  } else if (warningData.type === WarningType.SUSPECTED_SCAM) {
    const { requestId, chainId, hostname, bypassed, address } = warningData;
    track('Suspected scam detected', { requestId, chainId, hostname, bypassed, address });
  } else if (warningData.type === WarningType.HASH) {
    const { requestId, hostname, bypassed } = warningData;
    track('Hash signature requested', { requestId, hostname, bypassed });
  }
};

const calculatePopupPositions = (window: Browser.Windows.Window, warningData: WarningData) => {
  const width = 480;
  const height = calculatePopupHeight(warningData);

  const left = window.left! + Math.round((window.width! - width) * 0.5);
  const top = window.top! + Math.round((window.height! - height) * 0.2);

  return { width, height, left, top };
};

const calculatePopupHeight = (warningData: WarningData) => {
  const lineHeight = 20;
  const baseHeight = 14 * lineHeight;
  const bypassHeight = warningData.bypassed ? lineHeight : 0;

  if (warningData.type === WarningType.ALLOWANCE) {
    return baseHeight + bypassHeight + 3 * lineHeight + warningData.assets.length * lineHeight;
  } else if (warningData.type === WarningType.LISTING) {
    const offerLines = warningData.listing.offer.length + 1;
    const considerationLines = warningData.listing.consideration.length + 1;
    return baseHeight + bypassHeight + offerLines * lineHeight + considerationLines * lineHeight;
  } else if (warningData.type === WarningType.SUSPECTED_SCAM) {
    return baseHeight + bypassHeight + 2 * lineHeight;
  }

  return baseHeight + bypassHeight;
};

const createWarningPopup = async (warningData: WarningData) => {
  // Add a slight delay to prevent weird window positioning
  const delayPromise = new Promise((resolve) => setTimeout(resolve, 200));
  const [currentWindow] = await Promise.all([Browser.windows.getCurrent(), delayPromise]);
  const positions = calculatePopupPositions(currentWindow, warningData);

  const queryString = new URLSearchParams({ warningData: JSON.stringify(warningData) }).toString();
  const popupWindow = await Browser.windows.create({
    url: `confirm.html?${queryString}`,
    type: 'popup',
    ...positions,
  });

  // Specifying window position does not work on Firefox, so we have to reposition after creation (6 y/o bug -_-).
  // Has no effect on Chrome, because the window position is already correct.
  await Browser.windows.update(popupWindow.id!, positions);
};
