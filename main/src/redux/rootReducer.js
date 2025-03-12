const { combineReducers } = require('redux')
const { userReducer, productReducer, remoteUserReducer } = require('./slices')

const rootReducer = combineReducers({
  user: userReducer,
  product: productReducer,
  remoteUser: remoteUserReducer
})

module.exports = rootReducer
