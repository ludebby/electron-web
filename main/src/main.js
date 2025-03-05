const { app, BrowserWindow, WebContentsView, dialog, globalShortcut } = require('electron')
const path = require('path')
const fs = require('fs')

const icon = require('./icon.js')

const i18n = require('i18next')
const en = require('../asset/i18n/en.json')
const tw = require('../asset/i18n/zh-TW.json')

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

global.share = {}
global.share.appBaseDir = appBaseDir
global.share.userDataDir = userDataDir
global.share.logger = logger
global.share.manual = new Set()

const menu = require('./menu.js')

// 作業系統判斷
logger.log('debug', 'process.platform:%s', process.platform)
const isMsWin = (process.platform === 'win32')
const isMacos = (process.platform === 'darwin')

if (isMsWin) {
  // 會影響系統通知顯示
  app.setAppUserModelId('test app')
}

const iconPath = icon.iconPath()
logger.log('debug', 'iconPath:%s', iconPath)

// --Electron初始---------------------- //

let mainWindow
let myView, bookshopView, entranceView

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800, // 寬度
    height: 650, // 高度
    icon: iconPath,
    webPreferences: {
      // web層界接,封裝api供web層使用
      preload: path.join(__dirname, '/preload/main.js')
    }
  })
  mainWindow.loadFile('./src/tabBar/index.html')
  mainWindow.webContents.openDevTools({ mode: 'detach', title: 'main' })

  if (devMode) {
    // 開發階段直接與 React 連線
    // 載入 tabBar
    mainWindow.loadFile('./src/tabBar/index.html')
    // Open the DevTools.
    mainWindow.webContents.openDevTools({ mode: 'detach', title: 'main' })
  } else {
    mainWindow.loadFile('./src/tabBar/index.html')
    // 產品階段直接讀取 React 打包好的
    mainWindow.loadFile(path.join(__dirname, '../../bookshop/dist/index.html'))
    mainWindow.loadFile(path.join(__dirname, '../../my/dist/index.html'))
    // 正式版不開啟開發者工具
    // mainWindow.webContents.openDevTools()
  }

  // ------------------------------------ //
  // WebContentsView測試
  // 創建 tab1 view
  myView = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '/preload/my.js')
    }
  })
  myView.webContents.loadURL('http://localhost:8084')
  // myView.webContents.openDevTools({ mode: 'detach', title: 'my' })

  // 創建 tab2 view
  bookshopView = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '/preload/bookshop.js')
    }
  })
  bookshopView.webContents.loadURL('http://localhost:7859')
  // bookshopView.webContents.openDevTools({ mode: 'detach', title: 'bookshop' })

  // 創建 tab2 view
  entranceView = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '/preload/entrance.js')
    }
  })
  entranceView.webContents.loadURL('  http://localhost:8084/entrance.html')

  // 加入 tab1, tab2 到主視窗
  mainWindow.contentView.addChildView(myView)
  mainWindow.contentView.addChildView(bookshopView)
  mainWindow.contentView.addChildView(entranceView)

  global.share.mainWindow = mainWindow
  global.share.myView = myView
  global.share.bookshopView = bookshopView
  global.share.entranceView = entranceView
  // 設定初始大小
  updateContentViewSize('my')

  mainWindow.on('resize', () => {
    updateContentViewSize() // 確保視窗大小變更時同步更新
  })

  // ------------------------------------ //

  // 攔截關閉事件
  mainWindow.on('close', (event) => {
    event.preventDefault() // 阻止視窗自動關閉

    // 顯示確認對話框
    const choice = dialog.showMessageBoxSync(mainWindow, {
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
      mainWindow.destroy()
      app.quit()
    }
  })

  mainWindow.webContents.on('did-finish-load', function () {
    logger.log('debug', 'did-finish-load')
    // 預設顯示 tab1
    // myView.webContents.send('tab-active', true)
    // main to web主動訊息
    myView.webContents.send('main-to-web-send-channel', 'main-to-web-send-msg-tab1')
    bookshopView.webContents.send('main-to-web-send-channel', 'main-to-web-send-msg-tab2')
  })
}

// 更新 WebContentsView 的大小與可見性
function updateContentViewSize (activeTab = 'my') {
  if (!mainWindow || !myView || !bookshopView) return

  const bounds = mainWindow.getBounds()
  const contentBounds = { x: 0, y: 50, width: bounds.width - 25, height: bounds.height - 150 }

  switch (activeTab) {
    case 'my':
      myView.setBounds(contentBounds)
      bookshopView.setBounds({ x: 0, y: 0, width: 0, height: 0 }) // 隱藏 content2
      entranceView.setBounds({ x: 0, y: 0, width: 0, height: 0 }) // 隱藏 content2
      break
    case 'bookshop':
      bookshopView.setBounds(contentBounds)
      myView.setBounds({ x: 0, y: 0, width: 0, height: 0 }) // 隱藏 content2
      entranceView.setBounds({ x: 0, y: 0, width: 0, height: 0 }) // 隱藏 content2
      break
    case 'entrance':
      entranceView.setBounds(contentBounds)
      myView.setBounds({ x: 0, y: 0, width: 0, height: 0 }) // 隱藏 content2
      bookshopView.setBounds({ x: 0, y: 0, width: 0, height: 0 }) // 隱藏 content2
      break
    default:
  }

  // if (activeTab === 'my') {
  //   myView.setBounds(contentBounds)
  //   bookshopView.setBounds({ x: 0, y: 0, width: 0, height: 0 }) // 隱藏 content2
  // } else if (activeTab === 'entrance') {
  //   entranceView.setBounds(contentBounds)
  // } else {
  //   bookshopView.setBounds(contentBounds)
  //   myView.setBounds({ x: 0, y: 0, width: 0, height: 0 }) // 隱藏 content1
  // }
}
global.share.updateContentViewSize = updateContentViewSize

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  // 選單
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

logger.log('info', 'app start')

// --處理來自畫面端的訊息---------------------- //

require('./ipc/main.js')

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

callesm()
