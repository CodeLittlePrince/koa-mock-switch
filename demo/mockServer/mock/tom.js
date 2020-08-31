// 不需要mockSwitch的mock数据
module.exports = (params) => {
  return {
    message: 'error message',
    result: {
      msg: 'Hello Tom',
      data: {
        name: 'tom',
        age: 7,
        params: params
      },
      status: '200'
    }
  }
}