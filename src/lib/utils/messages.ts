import objectHash from 'object-hash';
import { Duplex } from 'readable-stream';
import { Address, Hex, isHex } from 'viem';
import Browser from 'webextension-polyfill';
import { RequestType } from '../constants';
import {
  InPageMessageData,
  Message,
  MessageData,
  MessageResponse,
  isTransactionMessage,
  isTypedSignatureMessage,
  isUntypedSignatureMessage,
} from '../types';

// TODO: Timeout
export const sendToStreamAndAwaitResponse = (stream: Duplex, data: InPageMessageData): Promise<boolean> => {
  return new Promise((resolve) => {
    const requestId = generateMessageId(data);
    stream.write({ requestId, data });

    const callback = (response: MessageResponse) => {
      if (response.requestId === requestId) {
        stream.off('data', callback);
        resolve(response.data);
      }
    };

    stream.on('data', callback);
  });
};

// TODO: Timeout
export const sendToPortAndAwaitResponse = (stream: Browser.Runtime.Port, data: MessageData): Promise<boolean> => {
  return new Promise((resolve) => {
    const requestId = generateMessageId(data);
    stream.postMessage({ requestId, data });

    const callback = (response: MessageResponse) => {
      if (response.requestId === requestId) {
        stream.onMessage.removeListener(callback);
        resolve(response.data);
      }
    };

    stream.onMessage.addListener(callback);
  });
};

export const sendToPortAndDisregard = (stream: Browser.Runtime.Port, data: MessageData): void => {
  const requestId = generateMessageId(data);
  stream.postMessage({ requestId, data });
};

const generateMessageId = (data: InPageMessageData | MessageData) => {
  if (data.type === RequestType.TRANSACTION) return objectHash(data.transaction);
  if (data.type === RequestType.TYPED_SIGNATURE) return objectHash(data.typedData);
  if (data.type === RequestType.UNTYPED_SIGNATURE) return objectHash(data.message);
  return objectHash(data);
};

export const normaliseMessage = (message: Message): Message => {
  if (isTransactionMessage(message)) {
    return {
      ...message,
      data: {
        ...message.data,
        transaction: {
          from: message.data.transaction.from?.toLowerCase() as Address,
          to: message.data.transaction.to?.toLowerCase() as Address,
          data: !!message.data.transaction.data
            ? ((isHex(message.data.transaction.data)
                ? message.data.transaction.data.toLowerCase()
                : `0x${message.data.transaction.data}`.toLowerCase()) as Hex)
            : undefined,
          value: message.data.transaction.value,
        },
      },
    };
  }

  // TODO: Normalise decimal addresses in verifyingContract
  if (isTypedSignatureMessage(message)) {
    return message;
  }

  if (isUntypedSignatureMessage(message)) {
    return message;
  }

  return message;
};
