const { Menu, shell, Tray, BrowserWindow } = require('electron')
const path = require('path')

const logger = global.share.logger

function createMenu (dialog, isMacos, appBaseDir, devMode) {
  const i18n = require('i18next')
  const menuTemplate = [
    {
      label: i18n.t('menu.menu1Title'),
      submenu: [
        {
          label: '[MessagePorts][tab1]main-to-web message',
          click () {
            global.share.messagePortTab1.postMessage('port2-to-port1,main-to-web-tab1')
          }
        },
        {
          label: '[MessagePorts][tab2]main-to-web message',
          click () {
            global.share.messagePortTab2.postMessage('port2-to-port1,main-to-web-tab2')
          }
        },
        { type: 'separator' },
        {
          label: '[channel][tab1]main-to-web message',
          click (item, focusedWindow) {
            // main to web主動訊息
            global.share.tab1View.webContents.send('main-to-web-send-channel', 'main-to-web-send-msg-tabl1')
          }
        },
        {
          label: '[channel][tab2]main-to-web message',
          click (item, focusedWindow) {
            // main to web主動訊息
            global.share.tab2View.webContents.send('main-to-web-send-channel', 'main-to-web-send-msg-tabl2')
          }
        },
        { type: 'separator' },
        {
          label: '[WebSocket]main-to-web message',
          click (item, focusedWindow) {
            const WebSocket = require('ws')
            // main to web主動訊息
            // [WebSocket]回傳訊息給所有連線的客戶端（廣播）
            global.share.wsServer.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send('main-to-web-send-msg')
              }
            })
          }
        },
        { type: 'separator' },
        {
          label: '[redux]測試全域狀態',
          click (item, focusedWindow) {
            // 以action改變全域狀態
            const { userActions } = require('./redux/actions')
            userActions.setUser({ name: 'Alice1', email: 'alice@example.com', editDate: new Date().toISOString() })

            // 以selector取出全域狀態
            const { userSelectors, productSelectors } = require('./redux/selectors')
            console.log('userSelectors', userSelectors.selectUser())
            console.log('productSelectors', productSelectors.selectProducts())
          }
        },
        {
          label: '[redux]檢視全域狀態',
          click (item, focusedWindow) {
            const store = require('./redux/store')
            logger.log('debug', 'store.getState():%s', JSON.stringify(store.getState(), null, 2))
          }
        }
      ]
    },
    {
      label: '編輯',
      submenu: [
        { label: '還原', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪下', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '複製', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '貼上', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '全選', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: '檢視',
      submenu: [
        { label: '[tabUI]重新載入', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        {
          label: '[tab1]重新載入',
          click (item, focusedWindow) {
            global.share.tab1View.webContents.reload()
          }
        },
        {
          label: '[tab2]重新載入',
          click (item, focusedWindow) {
            global.share.tab2View.webContents.reload()
          }
        },
        { type: 'separator' },
        { label: '重置縮放', accelerator: 'CmdOrCtrl+0', role: 'resetzoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+=', role: 'zoomin' },
        { label: '縮小', accelerator: 'CmdOrCtrl+-', role: 'zoomout' },
        { type: 'separator' },
        { label: '切換全螢幕', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: '視窗',
      submenu: [
        { label: '最小化', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: '關閉', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    },
    {
      label: '說明',
      submenu: [
        {
          label: '版本號',
          click (item, focusedWindow) {
            if (focusedWindow) {
              dialog.showMessageBox(focusedWindow, {
                type: 'info',
                title: '版本號',
                message: '1.0.0'
              })
            }
          }
        },
        {
          label: '網站',
          click () {
            shell.openExternal('https://electron.atom.io')
          }
        },
        {
          label: '使用手冊',
          click (item, focusedWindow) {
            if (focusedWindow) {
              const manual = require('./modal/manual')
              manual.showManual(focusedWindow)
            }
          }
        }
      ]
    }
  ]

  if (isMacos) {
    menuTemplate.unshift(
      {
        // macOS 強制使用應用名稱作為第一個選單標題，無論你在 label 設定什麼，macOS 都會覆蓋, 但 submenu 仍然可以自訂
        label: '應用名稱', // 這個 label 會被 macOS 覆蓋
        submenu: [
          { label: '退出', role: 'quit' }
        ]
      }
    )
  }

  menuTemplate.push({
    label: '開發工具',
    submenu: [
      {
        label: '[tabUI]開發人員工具',
        click (item, focusedWindow) {
          const c = global.share.tabUIWindow.webContents
          if (c.isDevToolsOpened()) {
            c.closeDevTools()
          } else {
            logger.log('debug', 'openDevTools tabUI')
            c.openDevTools({ mode: 'detach', title: 'tabUI' })
          }
        }
      },
      {
        label: '[tab1]開發人員工具',
        click (item, focusedWindow) {
          const c = global.share.tab1View.webContents
          if (c.isDevToolsOpened()) {
            c.closeDevTools()
          } else {
            logger.log('debug', 'openDevTools tab1')
            c.openDevTools({ mode: 'detach', title: 'tab1' })
          }
        }
      },
      {
        label: '[tab2]開發人員工具',
        click (item, focusedWindow) {
          const c = global.share.tab2View.webContents
          if (c.isDevToolsOpened()) {
            c.closeDevTools()
          } else {
            logger.log('debug', 'openDevTools tab2')
            c.openDevTools({ mode: 'detach', title: 'tab2' })
          }
        }
      }
    ]
  })

  if (devMode) {
    menuTemplate.push({
      label: '記錄檔',
      submenu: [
        {
          label: '檢視資訊記錄檔',
          click (item, focusedWindow) {
            if (focusedWindow) {
              const logViewer = require('./modal/logViewer')
              logViewer.showLogViewer('info', focusedWindow)
            }
          }
        },
        {
          label: '檢視錯誤記錄檔',
          click (item, focusedWindow) {
            if (focusedWindow) {
              const logViewer = require('./modal/logViewer')
              logViewer.showLogViewer('error', focusedWindow)
            }
          }
        }
      ]
    })
  }

  const appMenu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(appMenu)

  // tray,系統通知區域的小圖標,並可以提供內容選單
  const tray = new Tray(path.join(appBaseDir, 'icon', 'tray-16x16.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio', checked: true }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)

  // 右鍵選單
  const contextMenu1 = Menu.buildFromTemplate([
    { label: 'Item1', type: 'checkbox' },
    { label: 'Item2', type: 'checkbox' }
  ])
  const winList = BrowserWindow.getAllWindows()
  if (winList && winList.length > 0) {
    winList[0].webContents.on('context-menu', (e, params) => {
      contextMenu1.popup(winList[0], params.x, params.y)
    })
  }
}

module.exports = { createMenu }
