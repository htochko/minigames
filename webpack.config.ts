import path from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

// in case you run into any TypeScript error when configuring `devServer`
import "webpack-dev-server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: webpack.Configuration = {
  entry: "./src/app/index.ts",
  plugins: [
    new HtmlWebpackPlugin({
        template: './src/index.html', // html template
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/, // Rule for .css files
        use: ['style-loader', 'css-loader'], // Use css-loader then style-loader
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i, // Match common image file types
        type: 'asset/resource',         // Tells Webpack to emit the file and return the URL
      }
    ],
  },
  resolve: {
    tsconfig: true, // automatically find tsconfig.json
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: 'production', // Set Webpack mode (development or production),
  devServer: {
    static: path.resolve(__dirname, 'dist'), // Serve static files from the 'dist' directory
    port: 3000, // Serve the app on http://localhost:3000
    open: true, // Automatically opens the browser when the server starts
  },
};

export default (environment, argv) => {
  if (argv.mode === "development") {
    // ...
  } else if (argv.mode === "production") {
    // ...
  }

  return config;
};