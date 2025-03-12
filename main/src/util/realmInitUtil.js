// --------------------------------------------- //
// --realm db初始化------------------------//
const initRealmDB = async () => {
  const keytar = require('keytar')
  const crypto = require('crypto')
  const realmUtil = require('./realmUtil.js')

  const logger = global.share.logger

  // 產生realm加密金鑰
  const SERVICE_NAME = 'TestElectronReact2'
  const ACCOUNT_NAME = 'realm_encryption_key'

  // 檢查系統安全儲存是否已有金鑰
  let realmEncryptionKey = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
  if (!realmEncryptionKey) {
    logger.log('info', '[realm]產生realm加密金鑰')
    realmEncryptionKey = crypto.randomBytes(64).toString('hex')
    // 存入系統安全儲存
    await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, realmEncryptionKey)
  } else {
    logger.log('info', '[realm]使用之前產生的realm加密金鑰')
  }
  // 把realmEncryptionKey hex字串印出來 for debug
  // Realm Studio可以輸入realmEncryptionKey hex開啟加密realm檔案
  // logger.log('debug', 'realmEncryptionKey:%s', realmEncryptionKey)
  realmEncryptionKey = Buffer.from(realmEncryptionKey, 'hex')

  const db = await realmUtil.RealmDB.build(realmEncryptionKey)

  global.share.db = db
  global.share.realm = db.realm
}

// --------------------------------------------- //

module.exports = { initRealmDB }
