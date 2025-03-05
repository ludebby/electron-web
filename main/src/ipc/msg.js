const { BrowserWindow, ipcMain, dialog, Notification } = require('electron')

const logger = global.share.logger

// 顯示訊息框
ipcMain.handle('showMessageBox', async (event, args) => {
  const win = BrowserWindow.getFocusedWindow()
  dialog.showMessageBox(win, {
    type: args.type, // "none", "info", "error", "question","warning"
    title: args.title,
    message: args.message
  })
})

// 顯示錯誤訊息框
ipcMain.handle('showErrorBox', async (event, args) => {
  dialog.showErrorBox(args.title, args.message)
})

// 顯示確認訊息框
ipcMain.handle('showConfirmMessageBox', async (event, args) => {
  logger.log('debug', 'showConfirmMessageBox')
  const win = BrowserWindow.getFocusedWindow()
  let resp = false
  await dialog.showMessageBox(win, {
    type: 'question',
    title: args.title,
    message: args.message,
    cancelId: 1,
    buttons: [
      '是',
      '否'
    ]
  }).then((result) => {
    if (result.response === 0) {
      // 是
      resp = true
    } else {
      // 否
      resp = false
    }
  })
  return resp
})

// 錯誤訊息記錄
ipcMain.handle('logError', async (event, args) => {
  logger.log('error', args.message)
})

// 顯示系統通知
ipcMain.handle('showNotification', async (event, args) => {
  new Notification({ title: args.title, body: args.body }).show()
})
