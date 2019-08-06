const path = require('path');

module.exports = {
  entry: "./src/plugin.js",
  output: {
    path: path.resolve(__dirname, "..", "public"),
    filename: './plugin.min.js'
  }
}