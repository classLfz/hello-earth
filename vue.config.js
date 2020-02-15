const path = require('path')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/hello-earth/'
    : '/',
  productionSourceMap: false,
  configureWebpack: {
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils.js')
      }
    }
  }
}
