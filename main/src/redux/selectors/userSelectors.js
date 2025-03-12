const store = require('../store')

// console.log('完整 state:', store.getState())
const selectUser = () => store.getState().user

module.exports = {
  selectUser
}
