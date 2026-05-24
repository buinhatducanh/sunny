// webpack.config.cjs — standalone webpack config for NestJS with workspace packages
const path = require("path");
const fs = require("fs");

module.exports = {
  entry: path.resolve(__dirname, "src/main.ts"),
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    library: { type: "commonjs" },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            configFile: path.resolve(__dirname, "tsconfig.json"),
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@sunny-game/types": path.resolve(__dirname, "../packages/types/src"),
      "@sunny-game/constants": path.resolve(__dirname, "../packages/constants/src"),
      "@sunny-game/utils": path.resolve(__dirname, "../packages/utils/src"),
    },
  },
  externals: [
    function (context, request, callback) {
      fs.appendFileSync(
        path.join(__dirname, "webpack-ext.log"),
        `context="${context}" request="${request}"\n`
      );
      if (!request) return callback();
      // Bundle @sunny-game/* workspace packages (handled by aliases)
      if (request.startsWith("@sunny-game/")) {
        fs.appendFileSync(path.join(__dirname, "webpack-ext.log"), "  -> BUNDLE\n");
        return callback();
      }
      // Externalize all other node_modules as CommonJS
      if (!request.startsWith(".") && !request.startsWith("/")) {
        fs.appendFileSync(path.join(__dirname, "webpack-ext.log"), "  -> EXTERNAL\n");
        return callback(null, "commonjs " + request);
      }
      return callback();
    },
  ],
  mode: "none",
  optimization: {
    nodeEnv: false,
  },
  node: {
    __filename: false,
    __dirname: false,
  },
};
