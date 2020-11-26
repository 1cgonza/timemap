const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';
const path = require('path');

const APP_DIR = path.resolve(__dirname, './src');
const BUILD_DIR = path.resolve(__dirname, './build');

/** env variables from config.js */
const CONFIG = process.env.CONFIG || 'config.js';
const envConfig = require('./' + CONFIG);
const userConfig = {};
const userFeatures = {};
for (const k in envConfig) {
  userConfig[k] = JSON.stringify(envConfig[k]);
}

for (const k in envConfig['features']) {
  userFeatures[k] = JSON.stringify(envConfig['features'][k]);
}

const config = {
  entry: {
    index: `${APP_DIR}/index.jsx`,
  },
  output: {
    path: BUILD_DIR,
    filename: 'js/[name].[hash].js',
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['postcss-preset-env'],
              },
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.js(x)?$/,
        exclude: /node_modules/,
        include: `${APP_DIR}`,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(eot|svg|otf|ttf|woff|woff2|png)$/,
        use: {
          loader: 'file-loader',
        },
      },
    ],
  },
  node: {
    net: 'empty',
    tls: 'empty',
    dns: 'empty',
  },
  resolve: {
    extensions: ['*', '.js'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        ...userConfig,
        NODE_ENV: JSON.stringify('production'),
        features: userFeatures,
      },
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
  ],
};

module.exports = config;
