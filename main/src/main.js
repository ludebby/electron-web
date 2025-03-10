// Modules to control application life and create native browser window
/**
The main process, commonly a file named main.js, is the entry point to every Electron app.
It controls the life of the app, from open to close.
It also manages native elements such as the Menu, Menu Bar, Dock, Tray, etc.
The main process is responsible for creating each new renderer process in the app.
The full Node API is built in.

In Chromium, this process is referred to as the "browser process".
It is renamed in Electron to avoid confusion with renderer processes.

The main process' primary purpose is to create and manage application windows with the BrowserWindow module.

Each instance of the BrowserWindow class creates an application window that loads a web page in a separate renderer process.
You can interact with this web content from the main process using the window's webContents object.
 */

const start = process.hrtime() // 開始計時

const { app, BrowserWindow, WebContentsView, dialog, globalShortcut } = require('electron')
const path = require('path')
const fs = require('fs')

const appBaseDir = path.resolve(__dirname, '..')

/*
正式打包後appBaseDir會是xxx\resources\app.asar這樣的封裝格式
electron有調整fs可以將app.asar當作目錄般使用,但是檔案變成唯讀
其他第三方函式庫可能不一定支援app.asar操作
與開發模式時直接是目錄的情況還是有所差異

詳細文件
https://www.electronjs.org/docs/latest/tutorial/asar-archives
*/

// 透過electron取得作業系統使用者資料目錄
const userDataDir = app.getPath('userData')

// 是否為開發模式
// 根據env.json檔中的mode判斷要跑在develop或production模式
const env = JSON.parse(fs.readFileSync(path.join(appBaseDir, 'env.json')))
const devMode = (env.mode === 'develop')

// --logging模組----------------------//
const initLogger = require('./logging.js')
const logger = initLogger(devMode, userDataDir)

logger.log('debug', 'env.mode:%s', env.mode)

logger.log('debug', 'process.type:%s', process.type)
logger.log('debug', 'process.versions.chrome:%s', process.versions.chrome)
logger.log('debug', 'process.versions.electron:%s', process.versions.electron)

// --多語----------------------//
const i18n = require('i18next')
const en = require('../asset/i18n/en.json')
const tw = require('../asset/i18n/zh-TW.json')

logger.log('debug', 'env.language:%s', env.language)
const resources = {
  'en': {
    translation: en
  },
  'zh-TW': {
    translation: tw
  }
}

i18n.init({
  resources,
  lng: env.language, // 預設語言
  fallbackLng: 'zh-TW', // 如果當前切換的語言沒有對應的翻譯則使用這個語言，
  interpolation: {
    escapeValue: false
  }
})

// -------------------------------------//

global.share = {}
global.share.appBaseDir = appBaseDir
global.share.userDataDir = userDataDir
global.share.logger = logger

// -------------------------------------//

const testMainOnly = (process.env.testMainOnly === 'true')
logger.log('debug', 'testMainOnly:%s', testMainOnly)

// 作業系統判斷
logger.log('debug', 'process.platform:%s', process.platform)
const isMsWin = (process.platform === 'win32')
const isMacos = (process.platform === 'darwin')

if (isMsWin) {
  logger.log('debug', '使用windows環境執行')
} else if (isMacos) {
  const macUtil = require('./util/macUtil.js')
  logger.log('debug', `使用macos(${macUtil.getCPUArchitecture()})環境執行`)
}

if (isMsWin) {
  // 會影響系統通知顯示
  app.setAppUserModelId('test app')
}

const icon = require('./icon.js')
const iconPath = icon.iconPath()
logger.log('debug', 'iconPath:%s', iconPath)

// --Electron初始---------------------- //

let tabUIWindow
let tab1View, tab2View

function createWindow () {
  const winStart = process.hrtime() // 開始計時
  // Create the browser window. 建立chrome瀏覽器
  logger.log('debug', 'createWindow')
  tabUIWindow = new BrowserWindow({
    width: 800, // 寬度
    height: 650, // 高度
    icon: iconPath,
    webPreferences: {
      // web層界接,封裝api供web層使用
      preload: path.join(appBaseDir, '/render/preload/tabUI.js')
    }
  })
  if (devMode && !testMainOnly) {
    // [開發階段]直接與 tab UI dev server連線
    // 載入 tab UI
    tabUIWindow.loadURL('http://localhost:2000/')
  } else {
    // [產品階段]載入 tab UI 編譯後的程式碼
    tabUIWindow.loadFile('render/tabUI/index.html')
  }

  // ------------------------------------ //
  // WebContentsView測試
  // 創建 tab1 view
  tab1View = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(appBaseDir, '/render/preload/tab1.js')
    }
  })
  if (devMode && !testMainOnly) {
    // [開發階段]直接與 tab 1 dev server連線
    tab1View.webContents.loadURL('http://localhost:2001/')
  } else {
    // [產品階段]載入 tab 1 編譯後的程式碼
    tab1View.webContents.loadFile('render/tab1/index.html')
  }

  // 創建 tab2 view
  tab2View = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(appBaseDir, '/render/preload/tab2.js')
    }
  })
  if (devMode && !testMainOnly) {
    // [開發階段]直接與 tab 2 dev server連線
    tab2View.webContents.loadURL('http://localhost:2002/')
  } else {
    // [產品階段]載入 tab 2 編譯後的程式碼
    tab2View.webContents.loadFile('render/tab2/index.html')
  }

  // Open the DevTools.
  if (devMode) {
    tabUIWindow.webContents.openDevTools({ mode: 'detach', title: 'tabUI' })
    tab1View.webContents.openDevTools({ mode: 'detach', title: 'tab1' })
    tab2View.webContents.openDevTools({ mode: 'detach', title: 'tab2' })
  } else {
    // [產品階段]不開啟開發者工具
  }

  // 加入 tab1, tab2 到主視窗
  tabUIWindow.contentView.addChildView(tab1View)
  tabUIWindow.contentView.addChildView(tab2View)

  global.share.tabUIWindow = tabUIWindow
  global.share.tab1View = tab1View
  global.share.tab2View = tab2View

  // 設定初始大小
  updateContentViewSize('tab1') // 預設顯示 tab1

  tabUIWindow.on('resize', () => {
    updateContentViewSize() // 確保視窗大小變更時同步更新
  })

  // ------------------------------------ //

  // 攔截關閉事件
  tabUIWindow.on('close', (event) => {
    event.preventDefault() // 阻止視窗自動關閉

    // 顯示確認對話框
    const choice = dialog.showMessageBoxSync(tabUIWindow, {
      type: 'warning',
      title: '關閉程式',
      message: '確認關閉目前程式?',
      cancelId: 1,
      buttons: [
        '是',
        '否'
      ]
    })

    // 如果使用者選擇 "是"，則允許視窗關閉
    if (choice === 0) {
      tabUIWindow.destroy()
      app.quit()
    }
  })

  tabUIWindow.webContents.on('did-finish-load', function () {
    const winEnd = process.hrtime(winStart) // 計算經過的時間
    logger.log('info', `視窗初始化時間: ${winEnd[0]}s ${winEnd[1] / 1e6}ms`)
    logger.log('debug', 'did-finish-load')
    // 預設顯示 tab1
    tab1View.webContents.send('tab-active', true)
    // main to web主動訊息
    tab1View.webContents.send('main-to-web-send-channel', 'main-to-web-send-msg-tab1')
    tab2View.webContents.send('main-to-web-send-channel', 'main-to-web-send-msg-tab2')
  })
}

// 更新 WebContentsView 的大小與可見性
function updateContentViewSize (activeTab = 'tab1') {
  if (!tabUIWindow || !tab1View || !tab2View) return

  const bounds = tabUIWindow.getBounds()
  const contentBounds = { x: 0, y: 50, width: bounds.width - 25, height: bounds.height - 150 }

  if (activeTab === 'tab1') {
    tab1View.setBounds(contentBounds)
    tab2View.setBounds({ x: 0, y: 0, width: 0, height: 0 }) // 隱藏 content2
  } else {
    tab2View.setBounds(contentBounds)
    tab1View.setBounds({ x: 0, y: 0, width: 0, height: 0 }) // 隱藏 content1
  }
}
global.share.updateContentViewSize = updateContentViewSize

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  // 選單
  const menu = require('./menu.js')
  menu.createMenu(dialog, isMacos, appBaseDir, devMode)

  // macos 關閉程式快捷鍵
  if (isMacos) {
    globalShortcut.register('Command+Q', () => {
      app.quit()
    })
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (!isMacos) app.quit()
})

app.on('before-quit', () => {
  global.share.db.closeDB()
})

logger.log('info', 'app start')

// --處理來自畫面端的訊息---------------------- //

require('./ipc/tabUI.js')
require('./ipc/sharedState.js')
require('./ipc/file.js')
require('./ipc/msg.js')
require('./ipc/test.js')
require('./ipc/net.js')
require('./ipc/sqlite.js')
require('./ipc/realm.js')

// ------------------------ //
/*
esm第三方函式庫測試

esm格式的第三方函式庫可以透過await import方式使用,
但要注意驗證正式打包後的版本使用esm第三方函式庫的部分是否work,
若不work,可能是electron builder未將該函式庫納入打包,
需額外在electron builder中進行打包設定
*/

const callesm = async () => {
  // Dynamically loads the ESM module in a CommonJS project
  const mm = await import('music-metadata')

  // Create a readable stream from a file
  const audioStream = fs.createReadStream(global.share.appBaseDir + '/asset/audio/A0.mp3')

  // Parse the metadata from the stream
  const metadata = await mm.parseStream(audioStream, { mimeType: 'audio/mpeg' })

  // Log the parsed metadata
  logger.log('info', '[esm]metadata.format.codec:%s', metadata.format.codec)
}

setImmediate(() => {
  callesm()
})

const end = process.hrtime(start) // 計算經過的時間
logger.log('info', `程式初始化時間: ${end[0]}s ${end[1] / 1e6}ms`)
