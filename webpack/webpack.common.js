const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const WextManifestWebpackPlugin = require('wext-manifest-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');

const srcDir = path.join(__dirname, '..', 'src');
const targetBrowser = process.env.TARGET_BROWSER;

module.exports = {
  entry: {
    manifest: path.join(srcDir, 'manifest.json'),
    background: path.join(srcDir, 'background.ts'),
    'pages/popup': path.join(srcDir, 'pages', 'popup.tsx'),
    'pages/confirm-allowance': path.join(srcDir, 'pages', 'confirm-allowance.tsx'),
    'pages/confirm-hash-signature': path.join(srcDir, 'pages', 'confirm-hash-signature.tsx'),
    'pages/confirm-listing': path.join(srcDir, 'pages', 'confirm-listing.tsx'),
    'content-scripts/bypass-check': path.join(srcDir, 'content-scripts', 'bypass-check.tsx'),
    'content-scripts/inject-scripts': path.join(srcDir, 'content-scripts', 'inject-scripts.tsx'),
    'content-scripts/window-ethereum-messages': path.join(srcDir, 'content-scripts', 'window-ethereum-messages.tsx'),
    'injected/proxy-window-ethereum': path.join(srcDir, 'injected', 'proxy-window-ethereum.tsx'),
  },

  output: {
    path: path.join(__dirname, '..', 'dist', targetBrowser),
    filename: 'js/[name].js',
  },

  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks(chunk) {
        return chunk.name !== 'background';
      },
    },
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        include: path.resolve(srcDir),
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        type: 'javascript/auto', // prevent webpack handling json with its own loaders,
        test: /manifest\.json$/,
        use: {
          loader: 'wext-manifest-loader',
          options: {
            usePackageJSONVersion: true,
          },
        },
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      buffer: require.resolve('buffer/'),
      worker_threads: false,
      stream: require.resolve('stream-browserify'),
    },
  },

  plugins: [
    new WextManifestWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: '.', to: '.', context: 'public' },
        { from: './*/messages.json', to: '_locales', context: 'src/i18n/locales' },
      ],
      options: {},
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new DotenvPlugin(),
  ],
};
