import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { ethErrors } from 'eth-rpc-errors';
import { createWalletClient, custom } from 'viem';
import { Identifier, RequestType } from '../lib/constants';
import { sendToStreamAndAwaitResponse } from '../lib/utils/messages';

declare let window: Window & {
  [index: string]: any;
  ethereum?: any;
  coinbaseWalletExtension?: any;
};

const stream = new WindowPostMessageStream({
  name: Identifier.INPAGE,
  target: Identifier.CONTENT_SCRIPT,
});

let proxyInterval: NodeJS.Timer;

const proxyEthereumProvider = (ethereumProvider: any, name: string) => {
  // Only add our proxy once per provider
  if (!ethereumProvider || ethereumProvider.isRevokeCash) return;

  const sendHandler = {
    apply: (target: any, thisArg: any, argumentsList: any[]) => {
      const [payloadOrMethod, callbackOrParams] = argumentsList;

      // ethereum.send has three overloads:

      // ethereum.send(method: string, params?: Array<unknown>): Promise<JsonRpcResponse>;
      // > gets handled like ethereum.request
      if (typeof payloadOrMethod === 'string') {
        return ethereumProvider.request({ method: payloadOrMethod, params: callbackOrParams });
      }

      // ethereum.send(payload: JsonRpcRequest): unknown;
      // > cannot contain signature requests
      if (!callbackOrParams) {
        return Reflect.apply(target, thisArg, argumentsList);
      }

      // ethereum.send(payload: JsonRpcRequest, callback: JsonRpcCallback): void;
      // > gets handled like ethereum.sendAsync
      return ethereumProvider.sendAsync(payloadOrMethod, callbackOrParams);
    },
  };

  const sendAsyncHandler = {
    apply: (target: any, thisArg: any, argumentsList: any[]) => {
      const [request, callback] = argumentsList;

      if (request?.method === 'eth_sendTransaction') {
        const [transaction] = request?.params ?? [];
        if (!transaction) return Reflect.apply(target, thisArg, argumentsList);

        const type = RequestType.TRANSACTION;
        const client = createWalletClient({ transport: custom(ethereumProvider) });
        client
          .getChainId()
          .then((chainId) => sendToStreamAndAwaitResponse(stream, { type, transaction, chainId }))
          .then((isOk) => {
            if (isOk) {
              return Reflect.apply(target, thisArg, argumentsList);
            } else {
              const error = ethErrors.provider.userRejectedRequest(
                'Revoke.cash Confirmation: User denied transaction signature.'
              );
              const response = {
                id: request?.id,
                jsonrpc: '2.0',
                error,
              };
              callback(error, response);
            }
          });
      } else if (request?.method === 'eth_signTypedData_v3' || request?.method === 'eth_signTypedData_v4') {
        const [address, typedDataStr] = request?.params ?? [];
        if (!address || !typedDataStr) return Reflect.apply(target, thisArg, argumentsList);

        const typedData = JSON.parse(typedDataStr);

        const type = RequestType.TYPED_SIGNATURE;
        const client = createWalletClient({ transport: custom(ethereumProvider) });
        client
          .getChainId()
          .then((chainId) => sendToStreamAndAwaitResponse(stream, { type, address, typedData, chainId }))
          .then((isOk) => {
            if (isOk) {
              return Reflect.apply(target, thisArg, argumentsList);
            } else {
              const error = ethErrors.provider.userRejectedRequest(
                'Revoke.cash Confirmation: User denied message signature.'
              );
              const response = {
                id: request?.id,
                jsonrpc: '2.0',
                error,
              };
              callback(error, response);
            }
          });
      } else if (request?.method === 'eth_sign' || request?.method === 'personal_sign') {
        const [first, second] = request?.params ?? [];
        if (!first || !second) return Reflect.apply(target, thisArg, argumentsList);

        // if the first parameter is the address, the second is the message, otherwise the first is the message
        const message = String(first).replace(/0x/, '').length === 40 ? second : first;

        const type = RequestType.UNTYPED_SIGNATURE;
        sendToStreamAndAwaitResponse(stream, { type, message }).then((isOk) => {
          if (isOk) {
            return Reflect.apply(target, thisArg, argumentsList);
          } else {
            const error = ethErrors.provider.userRejectedRequest(
              'Revoke.cash Confirmation: User denied message signature.'
            );
            const response = {
              id: request?.id,
              jsonrpc: '2.0',
              error,
            };
            callback(error, response);
          }
        });
      } else {
        return Reflect.apply(target, thisArg, argumentsList);
      }
    },
  };

  const requestHandler = {
    apply: async (target: any, thisArg: any, argumentsList: any[]) => {
      const [request] = argumentsList;

      if (request?.method === 'eth_sendTransaction') {
        const [transaction] = request?.params ?? [];
        if (!transaction) return Reflect.apply(target, thisArg, argumentsList);

        const client = createWalletClient({ transport: custom(ethereumProvider) });
        const chainId = await client.getChainId();

        const type = RequestType.TRANSACTION;
        const isOk = await sendToStreamAndAwaitResponse(stream, { type, transaction, chainId });

        if (!isOk) {
          throw ethErrors.provider.userRejectedRequest('Revoke.cash Confirmation: User denied transaction signature.');
        }
      } else if (request?.method === 'eth_signTypedData_v3' || request?.method === 'eth_signTypedData_v4') {
        const [address, typedDataStr] = request?.params ?? [];
        if (!address || !typedDataStr) return Reflect.apply(target, thisArg, argumentsList);

        const typedData = JSON.parse(typedDataStr);

        const client = createWalletClient({ transport: custom(ethereumProvider) });
        const chainId = await client.getChainId();

        const type = RequestType.TYPED_SIGNATURE;
        const isOk = await sendToStreamAndAwaitResponse(stream, { type, address, typedData, chainId });

        if (!isOk) {
          throw ethErrors.provider.userRejectedRequest('Revoke.cash Confirmation: User denied message signature.');
        }
      } else if (request?.method === 'eth_sign' || request?.method === 'personal_sign') {
        const [first, second] = request?.params ?? [];
        if (!first || !second) return Reflect.apply(target, thisArg, argumentsList);

        // if the first parameter is the address, the second is the message, otherwise the first is the message
        const message = String(first).replace(/0x/, '').length === 40 ? second : first;

        const type = RequestType.UNTYPED_SIGNATURE;
        const isOk = await sendToStreamAndAwaitResponse(stream, { type, message });

        if (!isOk) {
          throw ethErrors.provider.userRejectedRequest('Revoke.cash Confirmation: User denied message signature.');
        }
      }

      return Reflect.apply(target, thisArg, argumentsList);
    },
  };

  Object.defineProperty(ethereumProvider, 'request', {
    value: new Proxy(ethereumProvider.request, requestHandler),
    writable: true,
  });

  Object.defineProperty(ethereumProvider, 'send', {
    value: new Proxy(ethereumProvider.send, sendHandler),
    writable: true,
  });

  Object.defineProperty(ethereumProvider, 'sendAsync', {
    value: new Proxy(ethereumProvider.sendAsync, sendAsyncHandler),
    writable: true,
  });

  ethereumProvider.isRevokeCash = true;
  // console.log('Added Revoke.cash to', name);
};

const proxyAllEthereumProviders = () => {
  if (!window.ethereum) return;
  clearInterval(proxyInterval);

  // Proxy the default window.ethereum provider
  proxyEthereumProvider(window.ethereum, 'window.ethereum');

  // Proxy any other providers listed on the window.ethereum object
  window.ethereum?.providers?.forEach((provider: any, i: number) => {
    proxyEthereumProvider(provider, `window.ethereum.providers[${i}]`);
  });

  // Proxy the window.coinbaseWalletExtension provider if it exists
  proxyEthereumProvider(window.coinbaseWalletExtension, 'window.coinbaseWalletExtension');

  // Proxy providers used by Liquality (they have different providers per chain -_-)
  const liqualityProviders = ['eth', 'rsk', 'bsc', 'polygon', 'arbitrum', 'fuse', 'avalanche', 'optimism'];
  liqualityProviders.forEach((name) => proxyEthereumProvider(window[name], `window.${name}`));
};

proxyInterval = setInterval(proxyAllEthereumProviders, 100);
proxyAllEthereumProviders();
