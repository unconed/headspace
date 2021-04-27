const path = require('path');
const {HotModuleReplacementPlugin} = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  output: {
    filename: '[name].js?t=' + Date.now(),
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.join(__dirname, "public/"),
    open: true,
    host: 'localhost',
    port: 5000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new DashboardPlugin(),
    new HotModuleReplacementPlugin(),
  ],
  module: {
    rules: [{
      test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            //options: babelOptions
          },
          {
            loader: 'ts-loader'
          }
        ]
      },
      //{
      //  test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/,
      //  type: 'asset',
      //},
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
  },
};
