const path = require('path');

module.exports = (env, argv) => {
  return {
    entry: "./src/avs.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: () => {
        if(argv.mode == 'development') {
          return './avs.js';
        } else {
          return './avs.min.js';
        }
      },
      sourceMapFilename: argv.mode == 'development' ? './avs.js.map' : './avs.min.js.map',
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
    watch: true,
    devtool: "source-map",
  }
}