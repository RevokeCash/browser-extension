import { Hash } from 'viem';
import Browser from 'webextension-polyfill';
import { AddressAllowList, HostnameAllowList, WarningType, warningSettingKeys } from './lib/constants';
import { AggregateDecoder } from './lib/decoders/AggregateDecoder';
import { ApproveDecoder } from './lib/decoders/transaction/ApproveDecoder';
import { IncreaseAllowanceDecoder } from './lib/decoders/transaction/IncreaseAllowanceDecoder';
import { IncreaseApprovalDecoder } from './lib/decoders/transaction/IncreaseApprovalDecoder';
import { Permit2ApproveDecoder } from './lib/decoders/transaction/Permit2ApproveDecoder';
import { SetApprovalForAllDecoder } from './lib/decoders/transaction/SetApprovalForAllDecoder';
import { SuspectedScamDecoder } from './lib/decoders/transaction/SuspectedScamDecoder';
import { Permit2BatchDecoder } from './lib/decoders/typed-signature/Permit2BatchDecoder';
import { Permit2SingleDecoder } from './lib/decoders/typed-signature/Permit2SingleDecoder';
import { PermitDecoder } from './lib/decoders/typed-signature/PermitDecoder';
import { PermitForAllDecoder } from './lib/decoders/typed-signature/PermitForAllDecoder';
import { BlurBulkDecoder } from './lib/decoders/typed-signature/listing/BlurBulkDecoder';
import { BlurDecorder } from './lib/decoders/typed-signature/listing/BlurDecoder';
import { LooksRareDecoder } from './lib/decoders/typed-signature/listing/LooksRareDecoder';
import { Seaport14Decoder } from './lib/decoders/typed-signature/listing/Seaport14Decoder';
import { Seaport1Decoder } from './lib/decoders/typed-signature/listing/Seaport1Decoder';
import { BiconomyNativeDecoder } from './lib/decoders/typed-signature/metatransactions/BiconomyNativeDecoder';
import { GsnRelayDecoder } from './lib/decoders/typed-signature/metatransactions/GsnRelayDecoder';
import { HashDecoder } from './lib/decoders/untyped-signature/HashDecoder';
import { Message, MessageResponse, WarningData } from './lib/types';
import { normaliseMessage } from './lib/utils/messages';
import { getStorage } from './lib/utils/storage';
import { track } from './lib/utils/analytics';

// Note that these messages will be periodically cleared due to the background service shutting down
// after 5 minutes of inactivity (see Manifest v3 docs).
const messagePorts: Record<string, Browser.Runtime.Port> = {};
const approvedMessages: Array<Hash> = [];
const seenMessages: Array<Hash> = [];

const transactionDecoders = [
  new ApproveDecoder(),
  new IncreaseAllowanceDecoder(),
  new IncreaseApprovalDecoder(),
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
    processMessage(normaliseMessage(message), remotePort);
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

  trackMessage(message);

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
    const { requestId, chainId, hostname, bypassed, spender } = warningData;
    const allowance = { spender };
    track('Allowance requested', { requestId, chainId, hostname, bypassed, allowance });
  } else if (warningData.type === WarningType.LISTING) {
    const { requestId, chainId, hostname, bypassed, platform } = warningData;
    track('NFT listing requested', { requestId, chainId, hostname, bypassed, platform });
  } else if (warningData.type === WarningType.SUSPECTED_SCAM) {
    const { requestId, chainId, hostname, bypassed, address } = warningData;
    track('Suspected scam detected', { requestId, chainId, hostname, bypassed, address });
  } else if (warningData.type === WarningType.HASH) {
    const { requestId, hostname, bypassed } = warningData;
    track('Hash signature requested', { requestId, hostname, bypassed });
  }
};

const trackMessage = (message: Message) => {
  if (seenMessages.includes(message.requestId)) return;
  seenMessages.push(message.requestId);
  track('Message received', { message });
};

const calculatePopupPositions = (window: Browser.Windows.Window, warningData: WarningData) => {
  const width = 520;
  const height = calculatePopupHeight(warningData);

  const left = window.left! + Math.round((window.width! - width) * 0.5);
  const top = window.top! + Math.round((window.height! - height) * 0.2);

  return { width, height, left, top };
};

const calculatePopupHeight = (warningData: WarningData) => {
  // This is an estimate of the height of the frame around the popup, unfortunately we can't get the actual value (which is OS / browser dependent)
  const FRAME_HEIGHT = 28;

  const BORDER_HEIGHT = 1;
  const MARGIN_HEIGHT = 12;

  const HEADER_HEIGHT = 64;
  const HOSTNAME_HEIGHT = 92; // Includes the Kerberus domain check
  const TITLE_HEIGHT = 44;

  const LINE_HEIGHT = 44;
  const DATA_SEPARATOR_HEIGHT = 28;

  const FOOTER_HEIGHT = 64;
  const WARNING_HEIGHT = 64;

  const baseHeight =
    FRAME_HEIGHT +
    HEADER_HEIGHT +
    BORDER_HEIGHT +
    HOSTNAME_HEIGHT +
    BORDER_HEIGHT +
    TITLE_HEIGHT +
    0 +
    MARGIN_HEIGHT +
    BORDER_HEIGHT +
    FOOTER_HEIGHT;
  const bypassHeight = warningData.bypassed ? WARNING_HEIGHT + MARGIN_HEIGHT : 0;

  if (warningData.type === WarningType.ALLOWANCE) {
    const spenderHeight = LINE_HEIGHT;
    const assetsHeight = LINE_HEIGHT * warningData.assets.length + BORDER_HEIGHT * (warningData.assets.length - 1);
    const contentHeight = spenderHeight + DATA_SEPARATOR_HEIGHT + assetsHeight;
    return baseHeight + bypassHeight + contentHeight;
  } else if (warningData.type === WarningType.LISTING) {
    const offerHeight =
      LINE_HEIGHT * warningData.listing.offer.length + BORDER_HEIGHT * (warningData.listing.offer.length - 1);
    const considerationHeight =
      LINE_HEIGHT * warningData.listing.consideration.length +
      BORDER_HEIGHT * (warningData.listing.consideration.length - 1);
    const contentHeight = offerHeight + DATA_SEPARATOR_HEIGHT + considerationHeight;
    return baseHeight + bypassHeight + contentHeight;
  } else if (warningData.type === WarningType.SUSPECTED_SCAM) {
    return baseHeight + bypassHeight + LINE_HEIGHT;
  } else if (warningData.type === WarningType.HASH) {
    return baseHeight + bypassHeight + LINE_HEIGHT + WARNING_HEIGHT + MARGIN_HEIGHT;
  }

  // Should not be reachable
  return baseHeight + bypassHeight + 2 * LINE_HEIGHT;
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
    focused: true,
    ...positions,
  });

  // Specifying window position does not work on Firefox, so we have to reposition after creation (6 y/o bug -_-).
  // Has no effect on Chrome, because the window position is already correct.
  await Browser.windows.update(popupWindow.id!, positions);
};
