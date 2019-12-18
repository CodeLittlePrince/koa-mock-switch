module.exports = [
  // 主页-hello 用到了运行时控制success和error
  {
    url: '/api/kitty',
    desc: '接口展示',
    selections: [
      {
        name: '成功',
        value: `[
          result [@success],
          @good
        ]`
      },
      {
        name: '失败',
        value: `[
          result [@error],
          @bad
        ]`
      }
    ]
  }
]