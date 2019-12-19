$('sendKittyBtn').addEventListener('click', () => {
  fetch('/api/kitty.htm')
    .then(res => {
      return res.json()
    })
    .then(data => {
      const result = data.result
      const msg = result.msg
      $('response').textContent = msg
    })
})

$('sendTomBtn').addEventListener('click', () => {
  fetch('/api/tom.htm')
    .then(res => {
      return res.json()
    })
    .then(data => {
      const result = data.result
      const msg = result.msg
      $('response').textContent = msg
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
    })
})

function $(node) {
  return document.getElementById(node)
}