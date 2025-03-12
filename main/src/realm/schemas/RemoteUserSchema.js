const RemoteUserSchema = {
  name: 'RemoteUser',
  properties: {
    id: 'int',
    name: 'string',
    email: 'string'
  },
  primaryKey: 'id'
}

module.exports = RemoteUserSchema
