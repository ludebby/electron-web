const { BrowserWindow } = require('electron')

const icon = require('./icon.js')

const logger = global.share.logger

function showManual (mainWindow) {
  // 關閉已開啟的視窗
  for (const item of global.share.manual) {
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

  const child = new BrowserWindow({
    parent: parent,
    modal: modal,
    width: 1100,
    height: 750,
    icon: icon.iconPath(),
    alwaysOnTop: true
  })
  child.setMenuBarVisibility(false)
  child.loadFile('./manual/index.html')
  global.share.manual.add(child)

  // 顯示視窗
  child.once('ready-to-show', () => {
    child.show()
  })

  // 視窗關閉判斷
  child.once('closed', () => {
    logger.log('debug', 'manual closed')
    global.share.manual.delete(child)
  })
}

module.exports = { showManual }
