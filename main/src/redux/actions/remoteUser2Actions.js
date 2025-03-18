const store = require('../store')
const { remoteUser2Actions } = require('../slices')

// 封裝
const fetchUser = (payload) => store.dispatch(remoteUser2Actions.fetchUser(payload))

module.exports = {
  fetchUser
}
