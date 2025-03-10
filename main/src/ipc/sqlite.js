const { ipcMain } = require('electron')

const sqliteUtil = require('../util/sqliteUtil.js')

const logger = global.share.logger

/*
sqlite為文件型資料庫,任何有文件檔案權限存取權限的使用者都可以直接讀取或修改資料庫內容,
重要資料注意要額外加密才存入資料庫,使用時解密,
重要資料要避免以明文方式存入資料庫,以避免資料外洩或被竄改的風險
*/

ipcMain.handle('callLocalDbSelect', async (event, args) => {
  logger.log('debug', 'callLocalDbSelect')
  const db = new sqliteUtil.SQLiteDB()
  try {
    // 查詢數據
    const rows = await db.all('SELECT id,name,age,datetime(editTime, \'unixepoch\', \'localtime\') as editTime FROM users')
    return rows
  } finally {
    db.closeDB()
  }
})

ipcMain.handle('callLocalDbUpdate', async (event, args) => {
  logger.log('debug', 'callLocalDbUpdate')
  const db = new sqliteUtil.SQLiteDB()
  try {
    // 更新數據
    // 取得當前 Unix 時間戳（秒）
    const editTime = Math.floor(Date.now() / 1000)

    const ret = await db.run('update users set age=?,editTime=? where id=?', [args.age, editTime, args.id])
    return ret.changes
  } finally {
    db.closeDB()
  }
})
