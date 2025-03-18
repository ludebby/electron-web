const { createSlice } = require('@reduxjs/toolkit')

// 使用 createSlice 定義 reducer 和 actions
const remoteUser2Slice = createSlice({
  name: 'remoteUser2',
  initialState: { userInfo: null, loading: false, error: null },
  reducers: {
    fetchUser: state => {
      state.loading = true
      state.error = null
    },
    fetchUserSuccess: (state, action) => {
      state.loading = false
      state.userInfo = action.payload
    },
    fetchUserFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    }
  }
})

module.exports = {
  remoteUser2Reducer: remoteUser2Slice.reducer,
  remoteUser2Actions: remoteUser2Slice.actions
}
