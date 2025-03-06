const PostSchema = {
  name: 'Post',
  properties: {
    _id: 'int',
    title: 'string',
    content: 'string',
    author: 'User'
  },
  primaryKey: '_id'
}

module.exports = PostSchema
