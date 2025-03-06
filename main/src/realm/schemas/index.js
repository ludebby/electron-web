// 匯總所有 Schema
const UserSchema = require('./UserSchema')
const PostSchema = require('./PostSchema')
const AllTypesSchema = require('./AllTypesSchema')
const EmbeddedSchema = require('./EmbeddedSchema')

module.exports = [UserSchema, PostSchema, AllTypesSchema, EmbeddedSchema]
