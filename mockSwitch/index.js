new Vue({
  el: '#app',
  data() {
    return {
      tableData: []
    }
  },
  mounted() {
    axios.post('/mock-switch/list')
      .then(res => {
        const data = res.data
        for (let i = 0, len = data.length; i < len; i++) {
          data[i].selections.forEach(item => {
            item.value = item.value.replace(/\s/g, '')
          })
          data[i].status = data[i].selections[0].value
        }
        this.tableData = data
      })
  },
  methods: {
    changeHandle(row) {
      axios.post('/mock-switch', {
        key: row.url,
        value: row.status
      })
    }
  }
})