const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const config = {
  mode: 'development',
  entry: {
    demo: path.join(__dirname, 'demo/front/index.js')
  },
  output: {
    path: path.join(__dirname, 'dev'),
    filename: 'demo.js',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dev'),
    proxy: {
      // 凡是 `/api` 开头的 http 请求，都会被代理到 target 上，由 koa 提供 mock 数据。
      '/': {
        target: 'http://0.0.0.0:7878', // 如果说联调了，将地址换成后端环境的地址就哦了
        secure: false,
        changeOrigin: true,
      }
    },
    port: 9898
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, 'demo/front/index.html')
    })
  ]
}

module.exports = config