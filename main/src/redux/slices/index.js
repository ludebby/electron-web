const userSlice = require('./userSlice')
const productSlice = require('./productSlice')
const remoteUserSlice = require('./remoteUserSlice')

module.exports = {
  userReducer: userSlice.userReducer,
  userActions: userSlice.userActions,
  productReducer: productSlice.productReducer,
  productActions: productSlice.productActions,
  remoteUserReducer: remoteUserSlice.remoteUserReducer,
  remoteUserActions: remoteUserSlice.remoteUserActions
}
