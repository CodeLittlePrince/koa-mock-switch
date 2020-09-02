// 不需要mockSwitch的mock数据
module.exports = ({ share }) => {
  share.updateByName('shareData1', '很多羊')
  // 我们也可以直接修改全局数据
  share.data.shareData1.money = 777
  
  return {
    result: {
      status: '200'
    }
  }
}