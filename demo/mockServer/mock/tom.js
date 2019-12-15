// 不需要mockSwitch的mock数据
module.exports = () => {
  return {
    message: 'error message',
    result: {
      msg: 'Hello Tom',
      data: {
        name: 'tom',
        age: 7
      },
      status: '200'
    }
  }
}