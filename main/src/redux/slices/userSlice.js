const { createSlice } = require('@reduxjs/toolkit')

// 使用 createSlice 定義 reducer 和 actions
const userSlice = createSlice({
  name: 'user',
  initialState: { name: '', email: '', editDate: null },
  reducers: {
    setUser: (state, action) => {
      state.name = action.payload.name
      state.email = action.payload.email
      state.editDate = action.payload.editDate
    },
    clearUser: (state) => {
      state.name = ''
      state.email = ''
      state.editDate = null
    }
  }
})

module.exports = {
  userReducer: userSlice.reducer,
  userActions: userSlice.actions // 匯出完整 actions 物件
}
