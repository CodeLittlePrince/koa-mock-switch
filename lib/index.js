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
    this.$share = {}
  }

  start() {
    // 初始化共享数据
    this._initMockShareDataByFile()
    // 删除前缀
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

  /**
   * 初始化共享数据
   * 共享数据是可以被所有接口引用的公共数据；
   * 各个接口可以根据判断公共数据的值，根据业务要求返回不同的数据。
   */
  _initMockShareDataByFile() {
    const shareMockDataHandle = require(`${this.mockRoot}/$share/index.js`)
    const shareMockDataKeys = Object.keys(shareMockDataHandle())
    
    this.$share = shareMockDataHandle()

    this.mockSwitchMap.share.forEach(item => {
      shareMockDataKeys.forEach(key => {
        if (item.name === key) {
          this.$share[key] = processMock(
            shareMockDataHandle()[key],
            item.selections[0].value
          )
        }
      })
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
      const mockValueRule = ctx.request.body.value
      const type = ctx.request.body.type

      // 如果接口类型为share，则说明要切换的是共享数据
      if (type === 'share') {
        const shareMockDataHandle = require(`${this.mockRoot}/$share/index.js`)
        let shareDataName = ctx.request.body.key

        this.$share[shareDataName] = processMock(shareMockDataHandle()[shareDataName], mockValueRule)
        ctx.body = this.$share[shareDataName]
      } else {
        let mockFilePath = ctx.request.body.key

        if (mockFilePath.startsWith(this.apiPrefix)) {
          mockFilePath = mockFilePath.slice(this.apiPrefix.length)
        }

        const apiMockDataHandle = require(`${this.mockRoot}${mockFilePath}.js`)

        // 模拟数据大管家 - cache
        // 注：一旦接口为switch级别接口，则无法再用接受接口请求参数的形式了（没得办法）
        this.$cache[mockFilePath] = processMock(apiMockDataHandle(null, this.$share), mockValueRule)
        ctx.body = this.$cache[mockFilePath]
      }
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
      let apiMockDataHandle = require(`${this.mockRoot}${path}.js`)
      // 返回数据
      // 如果mock-switch设置过，则从cache中（即$cache）获取即可
      if (this.$cache.hasOwnProperty(path)) {
        ctx.body = this.$cache[path]
      } else {
        // 因为mock-switch对应的mock数据的数据结构的特殊性，需要设置一个默认值
        // 因此遍历mockSwitchMap，如果当前path在mockSwitchMap中
        // 则直接用第一项为默认值
        const switchData = this.mockSwitchMap.api.find(item => {
          let url = item.url
          if (url.startsWith(this.apiPrefix)) {
            url = url.slice(this.apiPrefix.length)
          }

          return url === path
        })

        const params = ctx.request.method.toLowerCase() === 'get'
          ? ctx.request.query
          : ctx.request.body

        if (switchData) {
          this.$cache[path] = processMock(
            apiMockDataHandle(params, this.$share),
            switchData.selections[0].value
          )

          ctx.body = this.$cache[path]
        } else {
          // 不用mock-switch，正常返回
          ctx.body = apiMockDataHandle(params, this.$share)
        }
      }
      await next()
    }
  }
}

module.exports = KoaMockSwitch