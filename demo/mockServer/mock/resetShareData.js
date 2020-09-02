// 不需要mockSwitch的mock数据
module.exports = ({ share, switchMap }) => {
  if (5 < Math.random() * 10) {
    // 我们可以通过rule来切换全局数据
    share.updateByRule('shareData1', '[sheep [ @none ]]')
  } else {
    // 我们还可以通过switchMap（即mockSwitchMap）来用现有的rule来处理
    const rule = switchMap.share[0].selections[2].value
    share.updateByRule('shareData1', rule)
  }
  // 我们也可以直接修改全局数据
  share.data.shareData1.money = 777
  
  return {
    result: {
      status: '200'
    }
  }
}