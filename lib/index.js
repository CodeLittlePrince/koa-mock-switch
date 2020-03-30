const send = require('koa-send')
const Koa = require('koa')
const processMock = require('./processMock')
// 使用router
const Router = require('koa-router')
const Boom = require('boom')
const koaBody = require('koa-body')
const app = new Koa()
const router = new Router()
app.use(router.routes())
app.use(router.allowedMethods({
  throw: true,
  notImplemented: () => new Boom.notImplemented(),
  methodNotAllowed: () => new Boom.methodNotAllowed()
}))
// 使用bodyparser 解析get,post的参数
app.use(koaBody({
  multipart: true
}))

class KoaMockSwitch {
  constructor(config) {
    this.mockRoot = config.root
    this.port = config.port || 7777
    this.mockSwitchMap = config.switchMap || []
    this.apiPrefix = config.apiPrefix || ''
    this.apiSuffix = config.apiSuffix || '.json'
    this.$cache = {} // 设置一个cache，让/mock-switch设置过的数据能够直接给页面
  }

  start() {
    app.use(this._removeApiPrefix.bind(this))
    // 通过cache来控制模拟数据的状态切换
    app.use(this._mockDataByCacheMiddware.bind(this))
    // 通过文件来模拟数据
    app.use(this._mockDataByFileMiddware.bind(this))
    // 错误打印
    app.on('error', (err, ctx) => {
      console.log('server error', err, ctx)
    })
    // 注意：这里的端口要和webpack里devServer的端口对应
    this._server = app.listen(this.port)
  }

  stop() {
    this._server && this._server.close(() => {
      process.exit(0)
    })
  }

  async _removeApiPrefix(ctx, next) {
    if (ctx.path.startsWith(this.apiPrefix)) {
      ctx.path = ctx.path.slice(this.apiPrefix.length)
    }
    await next()
  }

  async _mockDataByCacheMiddware(ctx, next) {
    // '/mock-switch/list' 是为了让接口管理页面'/mock-switch/'通过配置文件展现数据
    // '/mock-switch/'     是接口管理页面
    // '/mock-switch'      是接口管理页面切换接口时候post的地址
    if (ctx.path.startsWith('/mock-switch/list')) {
      ctx.body = this.mockSwitchMap
    } else if (ctx.path.startsWith('/mock-switch/')) {
      var fileName = ctx.path.substr('/mock-switch/'.length)
      await send(
        ctx,
        './mockManagePage/' + (fileName || 'index.html'),
        { root: __dirname + '/' }
      )
    } else if (ctx.path.startsWith('/mock-switch')) {
      let mockFilePath = ctx.request.body.key
      const mockValueRule = ctx.request.body.value
      if (mockFilePath.startsWith(this.apiPrefix)) {
        mockFilePath = mockFilePath.slice(this.apiPrefix.length)
      }
      const mockHandle = require(`${this.mockRoot}${mockFilePath}.js`)
      // 模拟数据大管家 - cache
      this.$cache[mockFilePath] = processMock(mockHandle(), mockValueRule)
      ctx.body = this.$cache[mockFilePath]
    }
    await next()
  }

  async _mockDataByFileMiddware(ctx, next) {
    if (!ctx.path.startsWith('/mock-switch') &&
      ctx.path !== '/' &&
      ctx.path !== '/favicon.ico' &&
      ctx.path.indexOf('hot-update.json') === -1
    ) {
      // 为了寻找对应mock数据的js文件，去除接口后缀
      let path = ctx.path.replace(this.apiSuffix, '')
      // 调用对应的模拟数据
      let mockHandle = require(`${this.mockRoot}${path}.js`)
      // 返回数据
      // 如果mock-switch设置过，则从cache中（即$cache）获取即可
      if (this.$cache.hasOwnProperty(path)) {
        ctx.body = this.$cache[path]
      } else {
        // 因为mock-switch对应的mock数据的数据结构的特殊性，需要设置一个默认值
        // 因此遍历mockSwitchMap，如果当前path在mockSwitchMap中
        // 则直接用第一项为默认值
        const switchData = this.mockSwitchMap.find(item => {
          let url = item.url
          if (url.startsWith(this.apiPrefix)) {
            url = url.slice(this.apiPrefix.length)
          }
          return url === path
        })
        if (switchData) {
          this.$cache[path] = processMock(mockHandle(), switchData.selections[0].value)
          ctx.body = this.$cache[path]
        } else {
          // 不用mock-switch，正常返回
          ctx.body = mockHandle()
        }
      }
      await next()
    }
  }
}

module.exports = KoaMockSwitch