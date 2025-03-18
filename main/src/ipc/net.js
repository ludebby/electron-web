const { ipcMain } = require('electron')

const logger = global.share.logger

ipcMain.handle('callHttpService', async (event, args) => {
  logger.log('debug', 'callHttpService')
  try {
    const axios = require('axios')
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos/' + args.param)
    return response.data
  } catch (error) {
    return error
  }
})
