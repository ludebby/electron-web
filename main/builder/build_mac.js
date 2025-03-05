const path = require('path')
const builder = require('electron-builder')

const common = require('./common.js')

const appBaseDir = path.resolve(__dirname, '..')

// 更新web檔案
common.updateWeb(appBaseDir)

// 切換env.mode為production
common.setEnvMode('production', appBaseDir)

builder.build({

  projectDir: path.resolve(appBaseDir), // 專案路徑

  mac: ['dmg', 'dir'],
  config: {
    'appId': common.appId,
    'productName': common.productName, // 應用程式名稱 ( 顯示在應用程式與功能 )
    'directories': {
      'output': 'build/mac'
    },
    'mac': {
      'icon': path.resolve(appBaseDir, 'icon', 'app.icns'),
      category: 'public.app-category.education'
      // 'compression': 'store' // 壓縮級別（可選 "store", "normal" 或 "maximum"）
    },
    'dmg': {
      'background': 'dmg/install-background.tiff',
      'window': {
        'width': 540,
        'height': 428
      },
      'contents': [
        {
          'x': 150,
          'y': 140
        },
        {
          'x': 390,
          'y': 140,
          'type': 'link',
          'path': '/Applications'
        }
      ]
    }
  }
})
  .then(
    data => {
      console.log(data)
      // 切換env.mode為develop
      common.setEnvMode('develop', appBaseDir)
    },
    err => console.error(err)
  )
