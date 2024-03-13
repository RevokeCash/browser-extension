import { keccak256, toBytes } from 'viem';
import { getTransactionsInBlocks } from './utils/transactions';

const [_executable, _file, fragment, blockCountStr] = process.argv;

const signature = keccak256(toBytes(fragment)).slice(0, 10);
const blockCount = Number(blockCountStr) || 1;

const getTransactions = async () => {
  const transactions = await getTransactionsInBlocks(blockCount);

  const filteredTransactions = transactions.filter((transaction) => {
    return transaction.input?.startsWith(signature);
  });

  console.log(
    `${filteredTransactions.length}/${transactions.length} transactions match the signature in the last ${blockCount} blocks`
  );

  filteredTransactions.forEach((transaction) => console.log(transaction.hash, transaction.to));

  return filteredTransactions;
};

getTransactions();
