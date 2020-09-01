// 返回的结果处理
module.exports = (params, shareData) => {
  // 返回最终结果（配合mockSwitch）
  return {
    message: 'error message',
    params,
    result: {
      shareData,
      '@Jack': {
        name: 'Jack',
        age: 20,
        level: '普通用户'
      },
      '@Pony': {
        name: 'Pony',
        age: 22,
        level: '会员'
      },
      '@Jimmy': {
        name: 'Jimmy',
        age: 30,
        level: '大会员'
      },
      '@Susan': {
        name: 'Susan',
        age: 26,
        level: '超级会员'
      },
      '@Joy': {
        name: 'Joy',
        age: 18,
        level: {
          '@rich': '土豪会员',
          '@poor': '普通用户'
        }
      },
    }
  }
}