const store = require('../store')

const selectRemoteUser2 = () => store.getState().remoteUser2

module.exports = {
  selectRemoteUser2
}
