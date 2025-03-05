const sqlite3 = require('sqlite3')
const fs = require('fs')

const logger = global.share.logger

class SQLiteDB {
  // 建立資料庫連線的函式
  constructor () {
    const dbPath = global.share.userDataDir + '/sqlite/database.db'
    // logger.log('debug', 'dbPath:%s', dbPath)

    if (!fs.existsSync(dbPath)) {
      const dbRoot = global.share.userDataDir + '/sqlite'
      if (!fs.existsSync(dbRoot)) {
        fs.mkdirSync(dbRoot)
      }

      fs.copyFileSync(global.share.appBaseDir + '/sqlite/init_database.db', dbPath)
    }

    this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        logger.log('error', '[SQLite]連接失敗:%s', err.message)
      } else {
        logger.log('debug', '[SQLite]已成功連接')
      }
    })
  }

  // 查詢多筆資料
  all (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.log('error', '[SQLite]查詢錯誤:%s', err.message)
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  // 執行 SQL 命令（適用於 CREATE、UPDATE、DELETE）
  run (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          logger.log('error', '[SQLite]SQL 執行錯誤:%s', err.message)
          reject(err)
        } else {
          resolve(this)
        }
      })
    })
  }

  // 關閉資料庫連線的函式
  closeDB () {
    this.db.close((err) => {
      if (err) {
        logger.log('error', '[SQLite]關閉資料庫錯誤:%s', err.message)
      } else {
        logger.log('debug', '[SQLite]資料庫已關閉')
      }
    })
  }
}

module.exports = { SQLiteDB }
