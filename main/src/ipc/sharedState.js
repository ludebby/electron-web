const { ipcMain } = require('electron')

const logger = global.share.logger

let sharedState = { username: 'john', description: 'hello' } // 用來儲存狀態的變數

// 設定狀態
ipcMain.on('setSharedState', (event, data) => {
  logger.log('debug', '狀態更新:%s', data)
  sharedState = { ...sharedState, ...data }
})

// 取得狀態
ipcMain.handle('getSharedState', () => {
  return sharedState
})
