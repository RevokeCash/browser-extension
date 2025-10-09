import type { Filter, Log } from '../../utils/events';

export interface EventGetter {
  getLatestBlock: (chainId: number) => Promise<number>;
  getEvents: (chainId: number, filter: Filter) => Promise<Log[]>;
}
