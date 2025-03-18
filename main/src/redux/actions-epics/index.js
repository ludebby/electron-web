const { combineEpics } = require('redux-observable')

const fetchUserEpic = require('./fetchUserEpic')

module.exports = combineEpics(
  fetchUserEpic
)
