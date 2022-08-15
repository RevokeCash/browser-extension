import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { ethErrors } from 'eth-rpc-errors';
import { providers } from 'ethers';
import { Identifier } from '../constants';
import { sendAndAwaitResponseFromStream } from '../utils';

declare let window: {
  ethereum?: any;
}

const stream = new WindowPostMessageStream({
  name: Identifier.INPAGE,
  target: Identifier.CONTENT_SCRIPT,
});

let overrideInterval: NodeJS.Timer;

const overrideWindowEthereum = () => {
  if (!window.ethereum) return;

  clearInterval(overrideInterval);

  const sendHandler = {
    apply: (target: any, thisArg: any, argumentsList: any[]) => {
      const [payloadOrMethod, callbackOrParams] = argumentsList;

      // ethereum.send has three overloads:

      // ethereum.send(method: string, params?: Array<unknown>): Promise<JsonRpcResponse>;
      // > gets handled like ethereum.request
      if (typeof payloadOrMethod === 'string') {
        return window.ethereum.request({ method: payloadOrMethod, params: callbackOrParams })
      }

      // ethereum.send(payload: JsonRpcRequest): unknown;
      // > cannot contain signature requests
      if (!callbackOrParams) {
        return Reflect.apply(target, thisArg, argumentsList);
      }

      // ethereum.send(payload: JsonRpcRequest, callback: JsonRpcCallback): void;
      // > gets handled like ethereum.sendAsync
      return window.ethereum.sendAsync(payloadOrMethod, callbackOrParams);
    }
  }

  const sendAsyncHandler = {
    apply: (target: any, thisArg: any, argumentsList: any[]) => {
      const [request, callback] = argumentsList;

      if (request?.method === 'eth_sendTransaction') {
        const [transaction] = request?.params ?? [];
        if (!transaction) return Reflect.apply(target, thisArg, argumentsList);

        const provider = new providers.Web3Provider((window as any).ethereum);

        provider.getNetwork()
          .then(({ chainId }) => sendAndAwaitResponseFromStream(stream, { transaction, chainId }))
          .then((isOk) => {
            if (isOk) {
              return Reflect.apply(target, thisArg, argumentsList);
            } else {
              const error = ethErrors.provider.userRejectedRequest('Revoke.cash Confirmation: User denied transaction signature.')
              const response = {
                id: request?.id,
                jsonrpc: '2.0',
                error,
              }
              callback(error, response)
            }
          })
      } else {
        return Reflect.apply(target, thisArg, argumentsList);
      }
    }
  }

  const requestHandler = {
    apply: async (target: any, thisArg: any, argumentsList: any[]) => {
      const [request] = argumentsList;

      if (request?.method === 'eth_sendTransaction') {
        const [transaction] = request?.params ?? [];
        if (!transaction) return Reflect.apply(target, thisArg, argumentsList);

        const provider = new providers.Web3Provider((window as any).ethereum);
        const { chainId } = await provider.getNetwork();

        const isOk = await sendAndAwaitResponseFromStream(stream, { transaction, chainId });

        if (!isOk) {
          throw ethErrors.provider.userRejectedRequest('Revoke.cash Confirmation: User denied transaction signature.');
        }
      }

      return Reflect.apply(target, thisArg, argumentsList);
    },
  };

  const requestProxy = new Proxy((window as any).ethereum.request, requestHandler);
  const sendProxy = new Proxy((window as any).ethereum.send, sendHandler);
  const sendAsyncProxy = new Proxy((window as any).ethereum.sendAsync, sendAsyncHandler);

  (window as any).ethereum.request = requestProxy;
  (window as any).ethereum.send = sendProxy;
  (window as any).ethereum.sendAsync = sendAsyncProxy;
};

overrideInterval = setInterval(overrideWindowEthereum, 100);
overrideWindowEthereum();
