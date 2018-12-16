document.addEventListener('click', () => {
  fetch('/api/kitty.htm')
    .then(res => {
      return res.json()
    })
    .then(data => {
      const result = data.result
      const msg = result.msg
      response.textContent = msg
    })
})