const store = require('../store')

const selectProducts = () => store.getState().product

module.exports = {
  selectProducts
}
