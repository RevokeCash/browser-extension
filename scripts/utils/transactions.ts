import { createViemPublicClientForChain } from '../../src/lib/chains/chains';

// Inclusive range
const range = (start: number, end: number): number[] => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

export const getTransactionsInBlocks = async (blockCount: number = 1) => {
  const client = createViemPublicClientForChain(1)!;

  const toBlock = Number(await client.getBlockNumber());
  const fromBlock = toBlock - blockCount + 1;

  const blocks = await Promise.all(
    range(fromBlock, toBlock).map((blockNumber) =>
      client.getBlock({ blockNumber: BigInt(blockNumber), includeTransactions: true })
    )
  );

  const transactions = blocks.flatMap((block) => block.transactions);

  return transactions;
};
