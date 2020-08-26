const path = require('path')

module.exports = {
  mode: 'production',
  entry: ['./src/index.ts'],
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    // to make absolute path imports possible
    modules: [path.resolve(__dirname, './src'), 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'sass-loader', // compiles Sass to CSS, using Node Sass by default
        ],
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: { loader: 'html-loader' },
      },
      {
        test: /\.(jpe?g|png|gif|svg|mp3|wav)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
    ],
  },
}
