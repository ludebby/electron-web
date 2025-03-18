const { BrowserWindow } = require('electron')
const path = require('path')

const logger = global.share.logger

/*
  顯示BrowserWindow
*/
function showWin (mainWindow) {
  // 初始化視窗記錄
  if (global.share.testOpenWindow === undefined) {
    global.share.testOpenWindow = new Set()
  }

  const windowHolder = global.share.testOpenWindow

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

  const icon = require('../icon')
  const child = new BrowserWindow({
    parent: parent,
    modal: modal,
    width: 350,
    height: 350,
    icon: icon.iconPath(),
    alwaysOnTop: true,
    frame: false, // 以無框方式開啟,需自行處理拖拉與視窗關閉
    webPreferences: {
      preload: path.join(global.share.appBaseDir, '/render/preload/testOpenWindow.js')
    }
  })
  child.setMenuBarVisibility(false)
  child.loadFile('./render/testOpenWindow/index.html')

  // child.webContents.openDevTools({ mode: 'detach', title: 'testOpenWindow' })

  // 記錄已開啟視窗
  windowHolder.add(child)

  // 顯示視窗
  child.once('ready-to-show', () => {
    child.show()
  })

  child.webContents.on('did-finish-load', function () {
    // 模擬傳送初始化資料
    child.webContents.send('initData', '開啟時間:' + new Date().toISOString())
  })

  // 視窗關閉判斷
  child.once('closed', () => {
    logger.log('debug', 'testOpenWindow closed')
    windowHolder.delete(child)
  })
}

module.exports = { showWin }
