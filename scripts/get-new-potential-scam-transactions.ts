import { potentialScamSignatures } from '../src/lib/constants';
import { getTransactionsInBlocks } from './utils/transactions';

const [_executable, _file, blockCountStr] = process.argv;
const blockCount = Number(blockCountStr) || 1;

const getTransactions = async () => {
  const transactions = await getTransactionsInBlocks(blockCount);

  // These are the signatures of functions we expect to see in transactions with "scam" characteristics
  // (both scam and legitimate transactions)
  const ignoredSignatures = [
    '0x1249c58b', // mint()
    '0xfd01f462', // mintSubscription()
    '0xd2eb86ee', // publicSaleMint()
    '0x26092b83', // publicMint()
    '0xd0e30db0', // deposit()
    '0x1998aeef', // bid()
    '0x11b5444f', // buyWithEth()
    '0x6fb3acfa', // buy_with_eth()
    '0xa4821719', // buyToken()
    '0xa3c27069', // buyTokensEth()
    '0x439370b1', // depositEth()
    '0xf6326fb3', // depositETH()
    '0xf7654176', // split()
    '0x1b9265b8', // pay()
    '0xd46eb119', // wrap()
    '0x98ea5fca', // depositEther()
    '0xed995307', // addLiquidityETH()
    '0x7204d5e3', // increaseBid()
    '0x4246585f', // ??? - Seems to be used by internal CEX transactions
    '0x53eac367', // ??? - Seems to be used by internal CEX transactions
    ...potentialScamSignatures,
  ];

  // SecurityUpdates() and ClaimRewards() type scam transactions often look like this:
  const filteredTransactions = transactions.filter((transaction) => {
    return (
      transaction.value > 0n &&
      transaction.input.length >= 10 &&
      transaction.input.length < 50 &&
      !ignoredSignatures.includes(transaction.input.slice(0, 10))
    );
  });

  console.log(`${filteredTransactions.length}/${transactions.length} in the last ${blockCount} blocks`);

  filteredTransactions.forEach((transaction) =>
    console.log(transaction.hash, transaction.input.slice(0, 10), transaction.to),
  );

  return filteredTransactions;
};

getTransactions();
