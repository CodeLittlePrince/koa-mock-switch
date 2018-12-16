const chalk = require('chalk')
const send = require('koa-send')
const Koa = require('koa')
const processMock = require('./utils/processMock')
// 使用router
const Router = require('koa-router')
const Boom = require('boom')
const bodyParser = require('koa-bodyparser')
const app = new Koa()
const router = new Router()
app.use(router.routes())
app.use(router.allowedMethods({
  throw: true,
  notImplemented: () => new Boom.notImplemented(),
  methodNotAllowed: () => new Boom.methodNotAllowed()
}))
// 使用bodyparser 解析get,post的参数
app.use(bodyParser())

class KoaMockSwitch {
  constructor(mockRoot, mockSwitchMap, apiSuffix) {
    this.mockRoot = mockRoot
    this.mockSwitchMap = mockSwitchMap
    this.apiSuffix = apiSuffix || '.json'
    this.$config = {} // 设置一个cache，让/mock-switch设置过的数据能够直接给页面
  }

  start(port = 7777) {
    // 使用mockSwitch
    app.use(async (ctx, next) => {
      if (ctx.path.startsWith('/mock-switch/list')) {
        // '/mock-switch/list'是为了让接口管理页面'/mock-switch/'通过配置文件展现数据
        ctx.body = this.mockSwitchMap
      } else if (ctx.path.startsWith('/mock-switch/')) {
        // '/mock-switch/'是接口管理页面
        var fileName = ctx.path.substr('/mock-switch/'.length)
        await send(
          ctx,
          './mockSwitch/' + (fileName || 'index.html'),
          { root: __dirname + '/' }
        )
      } else if (ctx.path.startsWith('/mock-switch')) {
        // '/mock-switch'是接口管理页面切换接口时候post的地址
        const path = ctx.request.body.key
        const value = ctx.request.body.value
        const mockHandle = require(`${this.mockRoot}${path}.js`)
        // ====
        this.$config[path] = processMock(mockHandle(), value)
        // ====
        ctx.body = this.$config[path]
      }
      await next()
    })

    // 模拟数据返回
    app.use(async (ctx, next) => {
      if (!ctx.path.startsWith('/mock-switch') &&
      ctx.path !== '/' &&
      ctx.path !== '/favicon.ico' &&
      ctx.path.indexOf('hot-update.json') === -1
      ) {
        // 模拟
        let path = ctx.path.replace(this.apiSuffix, '')
        // 调用对应的模拟数据
        let mockHandle
        try {
          mockHandle = require(`${this.mockRoot}${path}.js`)
        } catch(e) {
          // 没有对应的mock模块
          console.log(chalk.redBright(`[error] the ${path}.js can't be found in ${this.mockRoot}`))
          await next()
          return
        }
        // 返回数据
        // 如果mock-switch设置过，则从cache中（即$config）获取即可
        if (this.$config.hasOwnProperty(path)) {
          ctx.body = this.$config[path]
        } else {
          // 因为mock-switch对应的mock数据的数据结构的特殊性，需要设置一个默认值
          // 因此遍历mockSwitchMap，如果当前path在mockSwitchMap中
          // 则直接用第一项为默认值
          const switchData = this.mockSwitchMap.find(item => item.url === path)
          if (switchData) {
            this.$config[path] = processMock(mockHandle(), switchData.selections[0].value)
            ctx.body = this.$config[path]
          } else {
            // 不用mock-switch，正常返回
            ctx.body = mockHandle()
          }
        }
        await next()
      }
    })

    // log error
    app.on('error', (err, ctx) => {
      console.log('server error', err, ctx)
    })

    // 注意：这里的端口要和webpack里devServer的端口对应
    const _server = app.listen(port)

    // 关闭监听保证进程关闭
    ;['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, () => {
        _server.close(() => {
          process.exit(0)
        })
      })
    })
  }
}

module.exports = KoaMockSwitch