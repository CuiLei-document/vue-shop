module.exports = {
  lintOnSave: false,
  configureWebpack:{
    resolve:{
      alias:{
        'assets':'@/assets',
        'views':'@/views',
      }
    }
  }
}
