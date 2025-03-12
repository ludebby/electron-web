const { configureStore } = require('@reduxjs/toolkit')
const rootReducer = require('./rootReducer')

const logger = global.share.logger

/*
require() 在 Node.js (也包含 Electron + CJS) 的模組系統中，有 模組快取機制 (Module Caching)
第一次 require('../store') 時，模組內的 configureStore() 會執行並產出唯一的 store
之後 不管多少地方再 require('../store')，都會回傳第一次建立的那個 store 實例，而不會再跑 configureStore()
*/
logger.log('debug', 'redux應用程式全域狀態已建立')
// 以redux建立應用程式全域狀態管理機制
const store = configureStore({
  reducer: rootReducer
})

module.exports = store
