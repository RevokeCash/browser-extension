import { keccak256, toBytes } from 'viem';

const fragment = process.argv[2];

const signature = keccak256(toBytes(fragment)).slice(0, 10);
console.log(signature);
