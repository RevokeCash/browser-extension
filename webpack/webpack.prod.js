const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  // Ensure no inline or external source maps are emitted in production bundles
  devtool: false,
});
