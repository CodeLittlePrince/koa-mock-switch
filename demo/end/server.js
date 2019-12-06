const path = require('path')
// mock文件的根目录
const mockRoot = path.join(__dirname, './mock')
// require koa-mock-switch
const KoaMockSwitch = require('../../index.js')
// mock管理列表
const mockSwitchMap = require('./mockSwitchMap.js')
/**
 * config
 * @param mockRoot mock文件的根目录
 * @param mockSwitchMap mock管理列表
 * @param apiSuffix 客户端请求api的后缀，比如'/api/kitty.json'，apiSuffix就是'.json'
 */
const mock = new KoaMockSwitch({
  root: mockRoot,
  switchMap: mockSwitchMap,
  apiSuffix: '.htm'
})
// 启动mock服务
mock.start(7878)

// nodemon会command+c终止终端都无法关闭mock进程
// 所以需要进程接受信号来调用koa-mock-switch接口来关闭
;['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    mock.stop()
  })
})