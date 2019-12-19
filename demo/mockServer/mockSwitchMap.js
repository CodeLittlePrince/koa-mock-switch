module.exports = [
  // 主页-hello 用到了运行时控制success和error
  {
    url: '/api/kitty',
    desc: 'Hello Kitty',
    selections: [
      {
        name: '成功',
        value: `[
          result [ @success ],
          @good
        ]`
      },
      {
        name: '失败',
        value: `[
          result [ @error ],
          @bad
        ]`
      }
    ]
  },

  {
    url: '/api/user',
    desc: '获取用户信息',
    selections: [
      {
        name: '普通用户',
        value: `[
          result [ level [ @normal ] ]
        ]`
      },
      {
        name: '会员',
        value: `[
          result [ level [ @vip ] ]
        ]`
      },
      {
        name: '大会员',
        value: `[
          result [ level [ @bigVip ] ]
        ]`
      },
      {
        name: '超级会员',
        value: `[
          result [ level [ @superVip ] ]
        ]`
      },
      {
        name: '土豪会员',
        value: `[
          result [ level [ @vvip ] ]
        ]`
      },
    ]
  }
]