// 定義嵌入式物件 Schema
const EmbeddedSchema = {
  name: 'EmbeddedModel',
  embedded: true, // 設定為嵌入式
  properties: {
    description: 'string?',
    value: 'int?'
  }
}

module.exports = EmbeddedSchema
