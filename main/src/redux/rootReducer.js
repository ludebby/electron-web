const { combineReducers } = require('redux')
const { userReducer, productReducer, remoteUserReducer, remoteUser2Reducer } = require('./slices')

const rootReducer = combineReducers({
  user: userReducer,
  product: productReducer,
  remoteUser: remoteUserReducer,
  remoteUser2: remoteUser2Reducer
})

module.exports = rootReducer
