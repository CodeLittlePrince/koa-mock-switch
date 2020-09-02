// 不需要mockSwitch的mock数据
module.exports = ({ params, share }) => {
  let msg = ''
  if (share.data.shareData1.sheep === 0) {
    msg = 'Tom! Are you crazy?'
  } else {
    msg = 'Hi Tom! You are so handsome!'
  }

  return {
    message: 'error message',
    params,
    result: {
      msg,
      data: {
        name: 'tom',
        age: 7,
        shareData: share.data,
      },
      status: '200'
    }
  }
}