const { BrowserWindow } = require('electron')

const logger = global.share.logger

/*
  以BrowserWindow顯示操作手冊
*/
function showManual (mainWindow) {
  // 初始化視窗記錄
  if (global.share.manual === undefined) {
    global.share.manual = new Set()
  }

  const windowHolder = global.share.manual

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
    alwaysOnTop: true
  })
  child.setMenuBarVisibility(false)
  child.loadFile('./render/manual/index.html')

  // 記錄已開啟視窗
  windowHolder.add(child)

  // 顯示視窗
  child.once('ready-to-show', () => {
    child.show()
  })

  // 視窗關閉判斷
  child.once('closed', () => {
    logger.log('debug', 'manual closed')
    windowHolder.delete(child)
  })
}

module.exports = { showManual }
