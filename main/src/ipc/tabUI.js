const { ipcMain } = require('electron')

const logger = global.share.logger

ipcMain.on('switch-tab', (event, tab) => {
  logger.log('debug', '[switch-tab]switch to %s ', tab)
  if (tab === 'tab1') {
    // global.share.tab1View.webContents.reload()
    global.share.tab1View.webContents.send('tab-active', true)
  } else if (tab === 'tab2') {
    // global.share.tab2View.webContents.reload()
    global.share.tab2View.webContents.send('tab-active', true)
  }
  global.share.updateContentViewSize(tab)
})
