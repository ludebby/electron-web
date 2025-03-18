const userSlice = require('./userSlice')
const productSlice = require('./productSlice')
const remoteUserSlice = require('./remoteUserSlice')
const remoteUser2Slice = require('./remoteUser2Slice')

module.exports = {
  userReducer: userSlice.userReducer,
  userActions: userSlice.userActions,
  productReducer: productSlice.productReducer,
  productActions: productSlice.productActions,
  remoteUserReducer: remoteUserSlice.remoteUserReducer,
  remoteUserActions: remoteUserSlice.remoteUserActions,
  remoteUser2Reducer: remoteUser2Slice.remoteUser2Reducer,
  remoteUser2Actions: remoteUser2Slice.remoteUser2Actions
}
