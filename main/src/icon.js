const path = require('path')

function iconPath () {
  const appBaseDir = path.resolve(__dirname, '..')

  const isMsWin = (process.platform === 'win32')
  const isMacos = (process.platform === 'darwin')

  // 圖標路徑(依os採不同檔案)
  let iconPath = ''
  if (isMsWin) {
    // windows
    iconPath = path.join(appBaseDir, 'icon', 'app.ico')
  } else if (isMacos) {
    // mac, mac要在build後才有圖標,此處無法改變mac圖標
  } else {
    // linux
    iconPath = path.join(appBaseDir, 'icon', 'app.png')
  }

  return iconPath
}

module.exports = { iconPath }
