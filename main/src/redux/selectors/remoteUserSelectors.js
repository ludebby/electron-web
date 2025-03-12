const store = require('../store')

const selectRemoteUser = () => store.getState().remoteUser

module.exports = {
  selectRemoteUser
}
