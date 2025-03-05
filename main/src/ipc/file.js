const { BrowserWindow, ipcMain, dialog } = require('electron')

const logger = global.share.logger

// 開啟檔案
ipcMain.handle('openFile', async (event, args) => {
  let resp
  try {
    const win = BrowserWindow.getFocusedWindow()
    await dialog.showOpenDialog(win, { properties: ['openFile'] }).then(function (response) {
      if (!response.canceled) {
        // handle fully qualified file name
        logger.log('debug', response.filePaths[0])
        resp = response.filePaths[0]
      } else {
        resp = 'no file selected'
      }
    })
  } catch (e) {
    logger.log('error', e.stack)
    dialog.showErrorBox('系統錯誤', e.message ? e.message : '')
  }
  return resp
})

// 開啟目錄
ipcMain.handle('openDir', async (event, args) => {
  let resp
  const win = BrowserWindow.getFocusedWindow()
  await dialog.showOpenDialog(win, { properties: ['openDirectory'] }).then(function (response) {
    if (!response.canceled) {
      // handle fully qualified file name
      logger.log('debug', response.filePaths[0])
      resp = response.filePaths[0]
    } else {
      resp = 'no file selected'
    }
  })
  return resp
})

// 儲存檔案
ipcMain.handle('saveFile', async (event, args) => {
  let resp = false
  const win = BrowserWindow.getFocusedWindow()
  await dialog.showSaveDialog(win, {
    title: '儲存檔案', // dialog 標題
    buttonLabel: '是' // label for the confirmation button
  })
    .then(result => {
      if (result.canceled) {
        logger.log('debug', 'user close SaveDialog')
      } else {
        logger.log('debug', result.filePath)
        resp = true
      }
    })
    .catch(err => {
      logger.log('error', err)
    })
  return resp
})
