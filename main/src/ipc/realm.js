const { ipcMain } = require('electron')

const logger = global.share.logger

ipcMain.handle('callRealmDbCreate', async (event, args) => {
  logger.log('debug', 'callRealmDbCreate')
  let ret = false
  const realm = global.share.realm
  realm.write(() => {
    const existingUser = realm.objectForPrimaryKey('User', 1) // 檢查是否已有此 _id
    if (existingUser) {
      logger.log('debug', '使用者已存在')
      return
    }

    // 建立使用者
    const user = realm.create('User', { _id: 1, name: 'Alice', age: 25, editDate: new Date() })

    // 建立文章
    const post1 = realm.create('Post', {
      _id: 101,
      title: 'Realm 資料庫教學',
      content: '這是一篇關於 Realm 資料庫的文章。',
      author: user // 關聯 User
    })

    const post2 = realm.create('Post', {
      _id: 102,
      title: 'Node.js 與 Realm 整合',
      content: '這篇文章介紹如何在 Node.js 中使用 Realm。',
      author: user // 關聯 User
    })

    user.posts.push(post1, post2) // 讓使用者擁有這些文章

    logger.log('debug', '已寫入使用者與文章')
    ret = true
  })

  return ret
})

ipcMain.handle('callRealmDbRead', async (event, args) => {
  logger.log('debug', 'callRealmDbRead')
  const realm = global.share.realm
  // 查詢 User 及其文章
  const user = realm.objectForPrimaryKey('User', 1)

  if (user) {
    // 轉換 User
    const userObj = {
      _id: user._id,
      name: user.name,
      age: user.age,
      editDate: user.editDate,
      posts: user.posts.map(post => ({
        _id: post._id,
        title: post.title,
        content: post.content
      }))
    }

    return userObj
  } else {
    return null
  }
})

ipcMain.handle('callRealmDbUpdate', async (event, args) => {
  logger.log('debug', 'callRealmDbUpdate')
  let ret = false
  const realm = global.share.realm
  realm.write(() => {
    // 外部傳入的參數，應該使用 佔位符 ($) 來避免 SQL 注入攻擊，而不是直接插入字串
    const obj = realm.objects('User').filtered('name == $0', args.name)[0]
    if (obj) {
      obj.age = args.age
      obj.editDate = new Date()
      console.log('Updated object:', obj.toJSON())
      ret = true
    }
  })
  return ret
})

ipcMain.handle('callRealmDbDelete', async (event, args) => {
  logger.log('debug', 'callRealmDbDelete')
  let ret = false
  const realm = global.share.realm
  realm.write(() => {
    const user = realm.objectForPrimaryKey('User', 1)
    if (user) {
      if (user.posts.length > 0) {
        realm.delete(user.posts) // 刪除所有 Post
      }
      realm.delete(user)
      ret = true
    }
  })
  return ret
})

// 展示所有欄位型態
ipcMain.handle('callRealmDbTypesTest', async (event, args) => {
  logger.log('debug', 'callRealmDbTypesTest')
  const { ObjectId, Decimal128, UUID } = require('realm').BSON

  const realm = global.share.realm
  realm.write(() => {
    const objects = realm.objects('AllTypesModel') // 取得該 Schema 下所有物件
    realm.delete(objects) // 刪除該 Schema 下所有物件

    // 填入一筆資料
    realm.create('AllTypesModel', {
      _id: new ObjectId(),
      boolField: true,
      intField: 42,
      floatField: 3.14,
      doubleField: 2.7182818284,
      stringField: 'Hello Realm!',
      dataField: Buffer.from([1, 2, 3, 4, 5]),
      decimalField: new Decimal128('1234.5678'),
      uuidField: new UUID(),
      dateField: new Date(),

      listField: [1, 2, 3, 4, 5],
      setField: ['apple', 'banana', 'cherry'],
      dictField: { key1: 'value1', key2: 123 },

      embeddedObject: { description: 'Test embedded object', value: 99 },
      relatedObject: null // 可設定為 null 或某個 TestModel
    })
  })

  // 顯示資料
  const testObjects = realm.objects('AllTypesModel')

  testObjects.forEach(obj => {
    console.log(`ID: ${obj._id}`)
    console.log(`Boolean: ${obj.boolField}`)
    console.log(`Integer: ${obj.intField}`)
    console.log(`Float: ${obj.floatField}`)
    console.log(`Double: ${obj.doubleField}`)
    console.log(`String: ${obj.stringField}`)
    console.log(`Decimal: ${obj.decimalField?.toString()}`)
    console.log(`UUID: ${obj.uuidField}`)
    console.log(`Date: ${obj.dateField}`)
    console.log(`List: ${obj.listField}`)
    console.log(`Set: ${[...obj.setField]}`)
    console.log(`Dictionary: ${JSON.stringify(obj.dictField)}`)
    console.log(`Embedded Object: ${JSON.stringify(obj.embeddedObject)}`)
  })
})
