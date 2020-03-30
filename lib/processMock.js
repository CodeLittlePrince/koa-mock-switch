const chalk = require('chalk')
/**
 * 处理模拟数据
 */
function processMock(mockData, mockValueRule) {
  // 除空格
  mockValueRule = mockValueRule.replace(/\s/g, '')
  // 校验
  if (!validateBracketMatch(mockValueRule)) {
    console.log(chalk.redBright('[error] the bracket of mockSwitchMap\'s value doesn\'t matched!'))
    return
  }
  // 校验
  if (!validateBracketBothSide(mockValueRule)) {
    console.log(chalk.redBright('[error] the bracket of mockSwitchMap\'s value doesn\'t appear at beginning or end!'))
    return
  }
  // 计算
  let resultData = computeMock(mockValueRule, mockData)
  // mockData最外层可能还是@类型字段，所以需要进一步处理
  const keys = Object.keys(resultData)
  const hasAtSignalPrefix = keys.some(key => {
    return -1 < key.indexOf('@')
  })
  if (hasAtSignalPrefix) {
    resultData = resultData[keys[0]]
  }
  return resultData
}

/**
 * 计算模拟数据
 */
function computeMock(mockValueRule, data) {
  const pieces = splitComma(mockValueRule)
  return mergeData(pieces, data)
}

/**
 * 根据字段名，从对象中取值，组合后返回
 */
function mergeData(pieces, data) {
  let rst = {}
  let keys = Object.keys(data)
  keys.forEach(key => {
    if (key.indexOf('@') === -1) {
      rst[key] = data[key]
    }
  })
  for (let i = 0, len = pieces.length; i < len; i++) {
    const p = pieces[i]
    let bracketIndex = p.indexOf('[')
    if (-1 < bracketIndex) {
      const key = p.slice(0, bracketIndex)
      const childPieces = splitComma(p.slice(bracketIndex), data[key])
      let mergeDataResult = mergeData(childPieces, data[key])
      const subKeys = Object.keys(mergeDataResult)
      subKeys.forEach(subKey => {
        // 如果subKey存在@，则需要把层级上移如:
        // result: { '@kitty': { age: 7 } } => result: { age: 7 }
        if (-1 < subKey.indexOf('@')) {
          mergeDataResult = Object.assign({}, mergeDataResult, mergeDataResult[subKey])
          delete mergeDataResult[subKey]
        }
      })
      rst[key] = mergeDataResult
    } else {
      // data[p]如果是对象类型，则用Object.assign赋值，否则直接赋值
      rst = type(data[p]) === 'Object' ? Object.assign({}, rst, data[p]) : data[p]
    }
  }
  return rst
}

/**
 * 按','为分割符，将最外层分割
 * 如: '[a[bc], d]' => ['a[bc]', 'd']
 */
function splitComma(str) {
  str = str.slice(1, -1)
  let rst = []
  let commaPlaces = []
  let bracketNoMatchCount = 0
  for(let i = 0, len = str.length; i < len; i++) {
    if(str[i] === '[') {
      bracketNoMatchCount++
    }
    if(str[i] === ']') {
      bracketNoMatchCount--
    }
    if(str[i] === ',' && bracketNoMatchCount === 0) {
      commaPlaces.push(i)
    }
  }
  let i = 0
  for(let len = commaPlaces.length; i < len; i++) {
    rst.push(str.slice(commaPlaces[i - 1] + 1, commaPlaces[i]))
  }
  rst.push(str.slice(commaPlaces[i - 1] + 1))
  return rst
}

/**
 * 验证字符串中括号是否匹配
 * 如: '[abc[d]'  --- false,
 *    '[abc[d]]' --- true
 */
function validateBracketMatch(str) {
  let leftBracketCount = 0
  let rightBracketCount = 0
  str.split('').forEach(item => {
    if (item === '[') {
      leftBracketCount ++
    }
    if (item === ']') {
      rightBracketCount ++
    }
  })
  return leftBracketCount === rightBracketCount
}

/**
 * 验证字符串中收尾括号是否存在
 * 如: 'abc]'  --- false,
 *    '[abc]' --- true
 */
function validateBracketBothSide(str) {
  let leftHas = str.slice(0, 1) === '['
  let rightHas = str.slice(-1) === ']'
  return leftHas && rightHas
}

function type(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1)
}

module.exports = processMock