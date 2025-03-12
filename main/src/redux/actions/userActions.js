const store = require('../store')
const { userActions } = require('../slices')

// 封裝 setUser
const setUser = (payload) => store.dispatch(userActions.setUser(payload))

// 封裝 clearUser
const clearUser = () => store.dispatch(userActions.clearUser())

module.exports = {
  setUser,
  clearUser
}
