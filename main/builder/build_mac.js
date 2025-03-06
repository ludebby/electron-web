const path = require('path')
const builder = require('electron-builder')

const common = require('./common.js')

const appBaseDir = path.resolve(__dirname, '..')

// 從各web程式包抓取其編譯程式碼
common.buildAndCopyWebBuild(appBaseDir).then(() => {
  // 切換env.json檔內的mode為production,再進行打包
  common.setEnvMode('production', appBaseDir)

  console.log('[ALL]prepare build')

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

        console.log('[ALL]build ok')
      },
      err => console.error(err)
    )
})
