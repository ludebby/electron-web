const { createSlice, createAsyncThunk } = require('@reduxjs/toolkit')

// fetchUserAsync：從 API 獲取使用者資料
const fetchUserAsync = createAsyncThunk(
  'user/fetchUserAsync',
  async (userId, { dispatch }) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
    const userData = await response.json()
    // 寫入realm資料庫
    const realm = global.share.realm
    realm.write(() => {
      // 如果已存在則更新
      realm.create('RemoteUser', {
        id: userData.id,
        name: userData.name,
        email: userData.email
      }, 'modified') // 'modified' 表示更新模式
    })
    return userData
  }
)

/*
使用 createAsyncThunk 時，extraReducers 用來處理非同步 action 的成功或失敗（fulfilled, rejected）狀態，
並且能夠根據這些狀態來更新 Redux 的 state。

每個異步 action 通常會有三個狀態：

pending：非同步操作開始時
fulfilled：非同步操作成功完成時
rejected：非同步操作失敗時
*/

const remoteUserSlice = createSlice({
  name: 'remoteUser',
  initialState: { userInfo: null, loading: false },
  reducers: {
    clearUser: (state) => {
      state.userInfo = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAsync.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserAsync.fulfilled, (state, action) => {
        state.loading = false
        state.userInfo = action.payload // 當成功獲取用戶資料後，更新 state
      })
      .addCase(fetchUserAsync.rejected, (state) => {
        state.loading = false
      })
  }
})

// 合併 actions，包含同步與非同步
const remoteUserActions = {
  ...remoteUserSlice.actions, // slice 自動生成的同步 actions
  fetchUserAsync // 手動加進去的 asyncThunk
}

module.exports = {
  remoteUserReducer: remoteUserSlice.reducer,
  remoteUserActions: remoteUserActions
}
