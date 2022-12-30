import { ScamSignatureIdentifier } from '../constants';
import { Transaction } from '../types';

export const checkSuspectedScamAddress = (transaction: Transaction) => {
  if (!transaction || !transaction.data || !transaction.to || !transaction.from) return undefined;
  const { data } = transaction;

  if (data.startsWith(ScamSignatureIdentifier.SecurityUpdate)) {
    return transaction.to;
  }

  return undefined;
};
