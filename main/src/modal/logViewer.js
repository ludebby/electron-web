const { BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')

const logger = global.share.logger

/*
 以BrowserWindow顯示應用的資訊記錄檔或錯誤記錄檔
*/
function showLogViewer (type, mainWindow) {
  // 初始化視窗記錄
  if (global.share.logViewer === undefined) {
    global.share.logViewer = new Set()
  }

  const windowHolder = global.share.logViewer

  // 關閉已開啟的視窗
  for (const item of windowHolder) {
    item.close()
  }

  // 準備視窗內容
  const isMacos = (process.platform === 'darwin')
  let parent = mainWindow
  let modal = true
  if (isMacos) {
    parent = null
    modal = false
  }

  const icon = require('../icon.js')
  const child = new BrowserWindow({
    parent: parent,
    modal: modal,
    width: 1100,
    height: 750,
    icon: icon.iconPath(),
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(global.share.appBaseDir, '/render/preload/logViewer.js')
    }
  })
  child.setMenuBarVisibility(false)
  child.loadFile('./render/logViewer/index.html')

  // child.webContents.openDevTools({ mode: 'detach', title: 'logViewer' })

  // 記錄已開啟視窗
  windowHolder.add(child)

  // 顯示視窗
  child.once('ready-to-show', () => {
    child.show()
  })

  // 視窗關閉判斷
  child.once('closed', () => {
    logger.log('debug', 'logViewer closed')
    windowHolder.delete(child)
  })

  // 顯示記錄檔內容
  child.webContents.once('did-finish-load', () => {
    let filePath
    if (type === 'error') {
      filePath = path.join(global.share.userDataDir, 'logs/error.log')
    } else {
      filePath = path.join(global.share.userDataDir, 'logs/info.log')
    }
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (!err) {
        child.webContents.send('showLog', data)
      }
    })
  })
}

module.exports = { showLogViewer }
