const path = require('path')

function initLogger (devMode, userDataDir) {
  const winston = require('winston')

  const errorLogPath = path.join(userDataDir, 'logs/error.log')
  const infoLogPath = path.join(userDataDir, 'logs/info.log')

  console.log('errorLogPath:%s', errorLogPath)

  let level = 'info'
  if (devMode) {
    level = 'debug'
  }

  const logger = winston.createLogger({
    // 當 transport 不指定 level 時 , 使用 info 等級
    level: level,
    // 設定輸出格式
    // format: winston.format.json(),
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}` + (info.splat !== undefined ? `${info.splat}` : ' '))
    ),
    // 設定此 logger 的日誌輸出器
    transports: [
      // 只有 error 等級的錯誤 , 才會將訊息寫到 error.log 檔案中
      new winston.transports.File({ filename: errorLogPath, level: 'error' }),
      // info or 以上的等級的訊息 , 將訊息寫入 info.log 檔案中
      new winston.transports.File({ filename: infoLogPath })
    ]
  })

  // 在開發模式時 , 將 log 訊息多輸出到 console 中
  if (devMode) {
    logger.add(new winston.transports.Console({
      // simple 格式 : `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
      // format: winston.format.simple()
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}` + (info.splat !== undefined ? `${info.splat}` : ' '))
      )
    }))
  }

  return logger
}

module.exports = initLogger
