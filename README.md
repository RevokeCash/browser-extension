# Revoke.cash Browser Extension

In many cases, phishing websites try to make you sign a token allowance while they pretend to be an NFT mint or other legitimate use cases. When these phishing scams happen, it is recommended to use the Revoke.cash website to mitigate the damage, but it is even better to prevent the scam in the first place.

This is where the Revoke.cash Browser Extension comes in. The extension pops up whenever you are about to sign an allowance and will inform you of the allowance details. This can help you prevent signing malicious allowances.

The extension also informs you when you are about to list an item for sale on OpenSea / LooksRare (outside of expected websites such as OpenSea, LooksRare, Genie and Gem), as this is also a common scam. These warnings can be configured in the extension settings.

The Revoke.cash browser extension works with every EVM-based network such as Ethereum, Avalanche or Polygon.

## Development

### Prerequisites

Contributing to the Revoke.cash extension requires Node.js v16+ and Yarn.

### Running locally

To continuously build the application using webpack you can run `yarn dev:chrome` or `yarn dev:firefox`. This will make sure that the `dist/` directory is always up to date. From there you can import the generated directory into your browser (e.g. through `chrome://extensions`).

### Building for publication

To build and package the extension for publication you can run `yarn build && yarn zip`. This will generate zip files for every supported platform that can be submitted to their respective extension stores.

## Credits

The Revoke.cash browser extension was created by Rosco Kalis after discussing the idea with Merwane Drai and Dries Steenberghe while working on Chaingrep in 2022.
