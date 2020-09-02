$('sendKittyBtn').addEventListener('click', () => {
  fetch('/api/kitty.htm?hello=123')
    .then(res => {
      return res.json()
    })
    .then(data => {
      const result = data.result
      const msg = result.msg
      $('response').textContent = msg
      fillSharedData(data.shareData.shareData1)
    })
})

$('sendTomBtn').addEventListener('click', () => {
  window.axios.post('/api/tom.htm', {hello: 123, kitty: 7})
    .then(data => {
      const result = data.data.result
      const msg = result.msg
      $('response').textContent = msg
      fillSharedData(data.data.result.data.shareData.shareData1)
    })
})

$('getUserInfo').addEventListener('click', () => {
  fetch('/api/user.htm')
    .then(res => {
      return res.json()
    })
    .then(data => {
      const result = data.result
      $('name').textContent = result.name
      $('age').textContent = result.age
      $('level').textContent = result.level
      fillSharedData(data.result.shareData.shareData1)
    })
})

$('changeShareDataBtn').addEventListener('click', () => {
  fetch('/api/changeShareData.htm')
    .then(res => {
      return res.json()
    })
    .then(() => {
      $('changeShareData').textContent = 'success'
    })
})

$('changeUserInfoBtn').addEventListener('click', () => {
  fetch('/api/changOtherApi.htm')
    .then(res => {
      return res.json()
    })
    .then(() => {
      $('changeUserInfo').textContent = 'success'
    })
})

function $(node) {
  return document.getElementById(node)
}

function fillSharedData(data) {
  $('money').textContent = data.money
  $('sheep').textContent = data.sheep
}