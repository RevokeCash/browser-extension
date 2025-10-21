export type TxParams = {
  from: `0x${string}`;
  to?: `0x${string}`;
  data?: `0x${string}`;
  value?: `0x${string}`;
  gas?: `0x${string}`;
  gasPrice?: `0x${string}`;
  maxFeePerGas?: `0x${string}`;
  maxPriorityFeePerGas?: `0x${string}`;
  nonce?: `0x${string}` | number;
};

// tenderly/types.ts
export type TenderlyConfig = {
  enabled: boolean;
  account?: string;
  project?: string;
  accessKey?: string;
  network?: string;
};

export type SimulationResult = {
  ok: boolean;
  url?: string;
  error?: string;
  gasUsed?: string;
  balanceDeltaNative?: string;
  assetsIn?: Array<{ symbol: string; amount: string; token?: string }>;
  assetsOut?: Array<{ symbol: string; amount: string; token?: string }>;
  raw?: any;
};
