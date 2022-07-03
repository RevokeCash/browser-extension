import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { Identifier } from './constants';
import { sendAndAwaitResponseFromStream } from './utils';
import { ethErrors } from 'eth-rpc-errors'

console.log('world', (window as any).ethereum);

const stream = new WindowPostMessageStream({
  name: Identifier.INPAGE,
  target: Identifier.CONTENT_SCRIPT,
});

let overrideInterval: NodeJS.Timer;

const overrideWindowEthereum = () => {
  if (!(window as any).ethereum) return;

  clearInterval(overrideInterval);

  const requestHandler = {
    apply: async (target: any, thisArg: any, argumentsList: any[]) => {
      const [request] = argumentsList;

      if (request?.method === 'eth_sendTransaction') {
        const isOk = await sendAndAwaitResponseFromStream(stream, request);

        if (!isOk) {
          throw ethErrors.provider.userRejectedRequest('Revoke.cash Confirmation: User denied transaction signature.');
        }
      }

      return Reflect.apply(target, thisArg, argumentsList);
    }
  }

  const requestProxy = new Proxy((window as any).ethereum.request, requestHandler);

  (window as any).ethereum.request = requestProxy;
}

overrideInterval = setInterval(overrideWindowEthereum, 100);
overrideWindowEthereum();
