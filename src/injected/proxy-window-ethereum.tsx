import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { Identifier } from '../constants';
import { sendAndAwaitResponseFromStream } from '../utils';
import { ethErrors } from 'eth-rpc-errors'
import { providers } from 'ethers';

console.log('world', (window as any).ethereum);

const stream = new WindowPostMessageStream({
  name: Identifier.INPAGE,
  target: Identifier.CONTENT_SCRIPT,
});

let overrideInterval: NodeJS.Timer;

const overrideWindowEthereum = () => {
  if (!(window as any).ethereum) return;

  clearInterval(overrideInterval);

  // TODO: Proxy send and sendAsync
  // https://docs.metamask.io/guide/ethereum-provider.html#legacy-methods

  const requestHandler = {
    apply: async (target: any, thisArg: any, argumentsList: any[]) => {
      const [request] = argumentsList;

      if (request?.method === 'eth_sendTransaction') {
        console.log(request);
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
    }
  }

  const requestProxy = new Proxy((window as any).ethereum.request, requestHandler);

  (window as any).ethereum.request = requestProxy;
}

overrideInterval = setInterval(overrideWindowEthereum, 100);
overrideWindowEthereum();
