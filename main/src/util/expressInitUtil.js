const path = require('path')
const fs = require('fs')

// --------------------------------------------- //
// --在main啟動一個local http server與local websocket server-------------------------- //

const initWebServer = () => {
  return new Promise((resolve, reject) => {
    const start = process.hrtime() // 開始計時

    const logger = global.share.logger

    const express = require('express')
    const cors = require('cors')
    const http = require('http')
    const WebSocket = require('ws')
    const mime = require('mime-types')

    const app = express()
    const server = http.createServer(app)
    const wsServer = new WebSocket.Server({ server })

    global.share.wsServer = wsServer

    // 解析 JSON 請求
    app.use(express.json())

    // cors設定
    const allowedOrigins = ['http://localhost:2001', 'http://localhost:2002']

    app.use(cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error('不允許的來源'))
        }
      }
    }))

    // express http路由
    // 模擬資料
    const users = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]

    // 獲取所有使用者
    app.get('/users', (req, res) => {
      res.json(users)
    })

    // 提供圖片資源範例
    app.get('/image/:imageName', (req, res) => {
      const media = req.params.imageName
      const imagePath = path.join(global.share.appBaseDir, '/asset/image/', media)
      res.sendFile(imagePath)
    })

    // 提供音檔資源範例
    app.get('/audio/:audioName', async (req, res) => {
      const media = req.params.audioName
      const type = mime.lookup(media)
      const mediaPath = path.join(global.share.appBaseDir, '/asset/audio/', media)
      if (await fileExists(mediaPath)) {
        const stat = await fs.promises.stat(mediaPath)
        const mediaSize = stat.size
        const range = readRangeHeader(req.headers.range, mediaSize)
        const start = range.Start
        const end = range.End
        logger.log('debug', '%s,start:%s,end:%s', media, start, end)
        const contentLength = end - start + 1
        const headers = {
          'Content-Range': `bytes ${start}-${end}/${mediaSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': contentLength,
          'Content-Type': type
        }
        res.writeHead(206, headers)
        /* 使用stream無法簡單控制檔案關閉時機
        const stream = fs.createReadStream(mediaPath, {
          start,
          end
        })
        stream.pipe(res)
        */
        fs.readFile(mediaPath, (err, data) => {
          if (err) {
            logger.log('error', err)
          } else {
            res.end(data.slice(start, end + 1))
          }
        })
      }
    })

    // WebSocket 連線
    wsServer.on('connection', (ws) => {
      logger.log('debug', '[WebSocket]新的客戶端已連線')

      // 接收來自客戶端的訊息
      ws.on('message', (message) => {
        logger.log('debug', `[WebSocket]收到客戶端訊息: ${message}`)
      })
    })

    // 啟動伺服器
    const PORT = 3000
    server.listen(PORT, () => {
      logger.log('info', `Local server is running on http://localhost:${PORT}  ws://localhost:${PORT}`)
      const end = process.hrtime(start) // 計算經過的時間
      logger.log('info', `web server初始化時間: ${end[0]}s ${end[1] / 1e6}ms`)
      resolve()
    })
  })
}

async function fileExists (filePath) {
  try {
    await fs.promises.access(filePath)
    return true
  } catch {
    return false
  }
}

function readRangeHeader (range, totalLength) {
  if (range == null || range.length === 0) {
    return {
      Start: 0,
      End: Math.floor(totalLength * 0.1)
    }
  }

  const array = range.split(/bytes=([0-9]*)-([0-9]*)/)
  const start = parseInt(array[1])
  const end = parseInt(array[2])
  const result = {
    Start: isNaN(start) ? 0 : start,
    End: isNaN(end) ? (totalLength - 1) : end
  }

  if (!isNaN(start) && isNaN(end)) {
    result.Start = start
    result.End = totalLength - 1
  }

  if (isNaN(start) && !isNaN(end)) {
    result.Start = totalLength - end
    result.End = totalLength - 1
  }

  return result
}
// --------------------------------------------- //

module.exports = { initWebServer }
