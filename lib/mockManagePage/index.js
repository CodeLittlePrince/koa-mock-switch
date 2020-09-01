new Vue({
  el: '#app',
  data() {
    return {
      apiTableData: [],
      shareTableData: []
    }
  },
  mounted() {
    axios.post('/mock-switch/list')
      .then(res => {
        const { share, api } = res.data

        this.activeFirstItem(share)
        this.activeFirstItem(api)

        this.apiTableData = api
        this.shareTableData = share
      })
  },
  methods: {
    changeHandle(row, type) {
      axios.post('/mock-switch', {
        type,
        key: type === 'share' ? row.name : row.url,
        value: row.status
      })
    },

    activeFirstItem(data) {
      for (let i = 0, len = data.length; i < len; i++) {
        data[i].selections.forEach(item => {
          item.value = item.value.replace(/\s/g, '')
        })
        data[i].status = data[i].selections[0].value
      }
    }
  }
})