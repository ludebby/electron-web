const { createSlice } = require('@reduxjs/toolkit')

// 使用 createSlice 定義 reducer 和 actions
const productSlice = createSlice({
  name: 'product',
  initialState: { items: [] },
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload
    },
    addProduct: (state, action) => {
      state.items.push(action.payload)
    }
  }
})

module.exports = {
  productReducer: productSlice.reducer,
  productActions: productSlice.actions
}
