const Realm = require('realm')

const schemas = require('./realm/schemas') // 匯入所有 Schema

const logger = global.share.logger

class RealmDB {
  // 建立資料庫連線的函式
  constructor (realm) {
    if (typeof realm === 'undefined') {
      throw new Error('Cannot be called directly')
    }

    this.realm = realm // 公開屬性
  }

  static async build () {
    const dbPath = global.share.userDataDir + '/realm/database.realm'
    // logger.log('debug', 'dbPath:%s', dbPath)
    const realm = await Realm.open({
      path: dbPath,
      schema: schemas, // 直接使用 schema 陣列
      encryptionKey: global.share.realmEncryptionKey // 設定加密金鑰
    })
    logger.log('debug', '[realm]已成功連接')
    return new RealmDB(realm)
  }

  // 關閉資料庫連線的函式
  closeDB () {
    this.realm.close()
    logger.log('debug', '[realm]資料庫已關閉')
  }
}

module.exports = { RealmDB }
