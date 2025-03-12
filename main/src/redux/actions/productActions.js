const store = require('../store')
const { productActions } = require('../slices')

// 封裝
const setProducts = (payload) => store.dispatch(productActions.setProducts(payload))
const addProduct = (payload) => store.dispatch(productActions.addProduct(payload))

module.exports = {
  setProducts,
  addProduct
}
