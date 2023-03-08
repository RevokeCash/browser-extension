# Revoke.cash Browser Extension

In many cases, phishing websites try to make you sign a token allowance while they pretend to be an NFT mint or other legitimate use cases. When these phishing scams happen, it is recommended to use the Revoke.cash website to mitigate the damage, but it is even better to prevent the scam in the first place.

This is where the Revoke.cash Browser Extension comes in. The extension pops up whenever you are about to sign an allowance and will inform you of the allowance details. This can help prevent signing malicious allowances.

The extension also informs you when you are about to list an item for sale on popular marketplaces such as OpenSea and LooksRare, or when you are about to sign a hash. These hashes are used by certain marketplaces like X2Y2 for listing NFTs.

A common scam is to try to trick you into signing one of these gasless signatures on a phishing website, allowing the scammers to steal your NFTs. The official websites of OpenSea, LooksRare, X2Y2, Genie, and Gem are allowlisted for these actions, so that the Revoke.cash browser extension does not interrupt your normal flow.

The different categories of warnings can be turned on and off in the extension settings.

The Revoke.cash browser extension works with every EVM-based chain including Ethereum, Polygon, and Avalanche.

## Development

### Prerequisites

Contributing to the Revoke.cash extension requires Node.js v16+ and Yarn.

### Running locally

To continuously build the application using webpack you can run `yarn dev:chrome` or `yarn dev:firefox`. This will make sure that the `dist/` directory is always up to date. From there you can import the generated directory into your browser (e.g. through `chrome://extensions`).

### Building for publication

To build and package the extension for publication you can run `yarn build && yarn zip`. This will generate zip files for every supported platform that can be submitted to their respective extension stores.

## Credits

The Revoke.cash browser extension was created by Rosco Kalis after discussing the idea with Merwane Drai and Dries Steenberghe while working on Chaingrep in 2022.

## Sponsors

To keep Revoke.cash free, we rely on donations and sponsorships for revenue. If you want to support us with a monthly sponsorship, please reach out through [Twitter](https://twitter.com/RevokeCash) and join the list of these awesome companies and individuals that have committed to a monthly sponsorship of Revoke.cash:

<p align="center">
  <a href="https://earni.fi">
    <img width="300" src="https://github.com/RevokeCash/revoke.cash/blob/master/public/assets/images/vendor/earnifi.png">
    <br />
    Earni.fi
  </a>
</p>
