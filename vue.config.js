const path = require('path')

module.exports = {
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
