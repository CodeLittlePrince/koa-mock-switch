// 返回的结果处理
module.exports = () => {
  // 返回最终结果（配合mockSwitch）
  return {
    message: 'error message',
    result: {
      name: 'Code Little Prince',
      age: 18,
      level: {
        '@normal': '普通用户',
        '@vip': '会员',
        '@bigVip': '大会员',
        '@superVip': '超级会员',
        '@vvip': '土豪会员'
      }
    }
  }
}