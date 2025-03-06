const UserSchema = {
  name: 'User',
  properties: {
    _id: 'int',
    name: 'string',
    age: 'int',
    editDate: 'date',
    posts: 'Post[]'
  },
  primaryKey: '_id'
}

module.exports = UserSchema
