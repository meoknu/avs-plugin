const path = require('path');

module.exports = {
  mode: "development",
  entry: "./src/avs.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: './avs.min.js',
    sourceMapFilename: "./avs.min.js.map",
    library: "AVS",
    libraryTarget: "var",
    libraryExport: "default"
  },
  module: {
    rules : [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      }
    ]
  },
  plugins: [],
  watch: false,
  devtool: "source-map",
}