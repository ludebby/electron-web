const { configureStore } = require('@reduxjs/toolkit')
const { createEpicMiddleware } = require('redux-observable')

const rootReducer = require('./rootReducer')
const rootEpic = require('./actions-epics')

const logger = global.share.logger

/*
require() 在 Node.js (也包含 Electron + CJS) 的模組系統中，有 模組快取機制 (Module Caching)
第一次 require('../store') 時，模組內的 configureStore() 會執行並產出唯一的 store
之後 不管多少地方再 require('../store')，都會回傳第一次建立的那個 store 實例，而不會再跑 configureStore()
*/
logger.log('info', 'redux應用程式全域狀態已建立')
// 以redux建立應用程式全域狀態管理機制

/*
Redux-Observable 是一種基於 RxJS 的 middleware，專門負責 Redux 中的 副作用 (Side Effects)，
像是 API 請求、非同步流程等，並用 Observable (可觀察物件) 來管理和組合這些非同步事件

RxJS擅長處理 事件流，像是按鈕點擊、API 請求、WebSocket、甚至組合多個 API 結果
可以輕鬆管理 取消 (cancel)、重試 (retry)、排程 (debounce)

redux-observable 就是 把所有 action 流 (action$) 當作一條 RxJS 的 Observable，讓你攔截想處理的 action，做完副作用，再發送新的 action

Epic 就是一個函數，輸入 action 流 (Observable of actions)，輸出另一個 action 流
*/
// 創建 epic middleware
const epicMiddleware = createEpicMiddleware()

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(epicMiddleware) // 添加 epic middleware
})

// 啟動 epic
epicMiddleware.run(rootEpic)

module.exports = store
