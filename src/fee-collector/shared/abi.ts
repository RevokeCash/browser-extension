import { ethers } from 'ethers';
import { EXECUTE2_SELECTOR, EXECUTE3_SELECTOR } from '../../lib/constants';

export const exec2Iface = new ethers.utils.Interface(['function execute(bytes commands, bytes[] inputs) payable']);
export const exec3Iface = new ethers.utils.Interface([
  'function execute(bytes commands, bytes[] inputs, uint256 deadline) payable',
]);

export function reencodeExecuteFunction(
  commandsHex: string,
  inputsArray: string[],
  deadlineMaybe?: string | number | ethers.BigNumber | null,
) {
  if (deadlineMaybe !== undefined && deadlineMaybe !== null) {
    const dl = ethers.BigNumber.from(String(deadlineMaybe));
    return exec3Iface.encodeFunctionData('execute', [commandsHex, inputsArray, dl]);
  }
  return exec2Iface.encodeFunctionData('execute', [commandsHex, inputsArray]);
}

export function decodeExecute(data: string) {
  const sig = data.slice(0, 10).toLowerCase();
  if (sig === EXECUTE3_SELECTOR) {
    const d: any = exec3Iface.decodeFunctionData('execute', data);
    const commands = d.commands ?? d[0];
    const inputs = (d.inputs ?? d[1]).map((b: any) => ethers.utils.hexlify(b));
    const deadline = (d.deadline ?? d[2]).toString();
    return { variant: 3, commands: ethers.utils.hexlify(commands), inputs, deadline };
  }
  if (sig === EXECUTE2_SELECTOR) {
    const d: any = exec2Iface.decodeFunctionData('execute', data);
    const commands = d.commands ?? d[0];
    const inputs = (d.inputs ?? d[1]).map((b: any) => ethers.utils.hexlify(b));
    return { variant: 2, commands: ethers.utils.hexlify(commands), inputs, deadline: null };
  }
  return null;
}
