// webpack.config.cjs — standalone webpack config for NestJS with workspace packages
const path = require("path");

const srcDir = path.resolve(__dirname, "src");
const distDir = path.resolve(__dirname, "dist/src");
const packagesDir = path.resolve(__dirname, "../../packages");

module.exports = {
  entry: path.resolve(srcDir, "main.ts"),
  target: "node",
  output: {
    path: distDir,
    filename: "main.js",
    library: { type: "commonjs" },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                decorators: true,
              },
              target: "es2022",
              externalHelpers: false,
              transform: {
                legacyDecorator: true,
                decoratorMetadata: true,
              },
            },
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@sunny-game/types": path.resolve(packagesDir, "types/src"),
      "@sunny-game/constants": path.resolve(packagesDir, "constants/src"),
      "@sunny-game/utils": path.resolve(packagesDir, "utils/src"),
      "@sunny-game/types/card.types": path.resolve(packagesDir, "types/src/card.types.ts"),
      "@sunny-game/types/player.types": path.resolve(packagesDir, "types/src/player.types.ts"),
      "@sunny-game/types/economy.types": path.resolve(packagesDir, "types/src/economy.types.ts"),
      "@sunny-game/constants/game.constants": path.resolve(packagesDir, "constants/src/game.constants.ts"),
      "@sunny-game/constants/env.data": path.resolve(packagesDir, "constants/src/env.data.ts"),
      "@sunny-game/constants/card.data": path.resolve(packagesDir, "constants/src/card.data.ts"),
      "@sunny-game/constants/profession.data": path.resolve(packagesDir, "constants/src/profession.data.ts"),
      "@sunny-game/constants/quest.data": path.resolve(packagesDir, "constants/src/quest.data.ts"),
      "@sunny-game/constants/achievement.data": path.resolve(packagesDir, "constants/src/achievement.data.ts"),
      "@sunny-game/utils/random": path.resolve(packagesDir, "utils/src/random.ts"),
      "@sunny-game/utils/math": path.resolve(packagesDir, "utils/src/math.ts"),
      "@sunny-game/utils/validation": path.resolve(packagesDir, "utils/src/validation.ts"),
    },
  },
  externals: [
    "@prisma/client",
    "@prisma/client/runtime",
    "@prisma/client/runtime/client",
    "@prisma/client/runtime/index-browser",
    "@prisma/adapter-pg",
    "@prisma/driver-adapter-utils",
    function ({ context, request }, callback) {
      if (!request) return callback();
      if (request.startsWith("@sunny-game/")) return callback();
      if (request.includes("/src/") || request.includes("\\src\\")) {
        return callback();
      }
      if (!request.startsWith(".") && !request.startsWith("/")) {
        return callback(null, "commonjs " + request);
      }
      return callback();
    },
  ],
  mode: "none",
  optimization: { nodeEnv: false },
  node: { __filename: false, __dirname: false },
  plugins: [
    // Disable ForkTsCheckerWebpackPlugin after NestJS CLI adds it
    // to avoid TS module resolution errors when CommonJS code imports ESM types
    {
      apply(compiler) {
        compiler.hooks.afterPlugins.tap("RemoveForkTsChecker", (compiler) => {
          compiler.options.plugins = compiler.options.plugins.filter(
            (p) => !p || p.constructor?.name !== "ForkTsCheckerWebpackPlugin"
          );
        });
      },
    },
  ],
};
