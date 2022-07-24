const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const srcDir = path.join(__dirname, '..', 'src');

module.exports = {
  entry: {
    background: path.join(srcDir, 'background.ts'),
    'pages/popup': path.join(srcDir, 'pages', 'popup.tsx'),
    'pages/confirm': path.join(srcDir, 'pages', 'confirm.tsx'),
    'content-scripts/bypass-check': path.join(srcDir, 'content-scripts', 'bypass-check.tsx'),
    'content-scripts/inject-scripts': path.join(srcDir, 'content-scripts', 'inject-scripts.tsx'),
    'content-scripts/window-ethereum-messages': path.join(srcDir, 'content-scripts', 'window-ethereum-messages.tsx'),
    'injected/proxy-window-ethereum': path.join(srcDir, 'injected', 'proxy-window-ethereum.tsx'),
  },
  output: {
    path: path.join(__dirname, '../dist/js'),
    filename: '[name].js',
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
    new CopyPlugin({
      patterns: [{ from: '.', to: '../', context: 'public' }],
      options: {},
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};
