const store = require('../store')
const { remoteUserActions } = require('../slices')

// 封裝
const fetchUserAsync = (payload) => store.dispatch(remoteUserActions.fetchUserAsync(payload))
const clearUser = () => store.dispatch(remoteUserActions.clearUser())

module.exports = {
  fetchUserAsync,
  clearUser
}
