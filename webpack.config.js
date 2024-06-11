// webpack.config.js
const crypto = require.resolve('crypto-browserify');
const stream = require.resolve('stream-browserify');

module.exports = {
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify")
    }
  }
};