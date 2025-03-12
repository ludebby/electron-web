const AllTypesSchema = {
  name: 'AllTypesModel',
  properties: {
    _id: 'objectId', // MongoDB ObjectId （唯一識別碼）
    boolField: 'bool', // 布林值（true/false）
    intField: 'int?', // 整數（64-bit）
    floatField: 'float?', // 32-bit 浮點數
    doubleField: 'double?', // 64-bit 浮點數
    stringField: 'string?', // 字串（UTF-8 編碼）
    dataField: 'data?', // Buffer, 二進位數據（Blob, 用於儲存圖片、音訊等）
    decimalField: 'decimal128?', // 128-bit 十進位數（適用於金融運算）
    uuidField: 'uuid?', // 通用唯一識別碼（UUID v4）
    dateField: 'date?', // 日期與時間（以 Date 格式存儲，毫秒精度）

    listField: 'int[]', // 陣列/列表（類似 Array 或 List，可包含相同類型的多個值）
    setField: 'string<>', // 集合（確保值唯一）
    dictField: 'mixed{}', // 字典（鍵值對存儲）

    embeddedObject: 'EmbeddedModel?', // 嵌入式物件（適用於父子關聯，子物件不會獨立存在）
    relatedObject: 'AllTypesModel?' // 自關聯
  },
  primaryKey: '_id'
}

module.exports = AllTypesSchema
