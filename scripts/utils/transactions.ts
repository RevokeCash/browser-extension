import dotenv from 'dotenv';
import { getChainProvider } from '../../src/lib/utils/chains';

dotenv.config();

// Inclusive range
const range = (start: number, end: number): number[] => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

export const getTransactionsInBlocks = async (blockCount: number = 1) => {
  const provider = getChainProvider(1, process.env.INFURA_API_KEY);

  const toBlock = await provider.getBlockNumber();
  const fromBlock = toBlock - blockCount + 1;

  const blocks = await Promise.all(
    range(fromBlock, toBlock).map((blockNumber) => provider.getBlockWithTransactions(blockNumber))
  );

  const transactions = blocks.flatMap((block) => block.transactions);

  return transactions;
};
