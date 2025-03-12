const { ipcMain } = require('electron')

const logger = global.share.logger

// electron ipc
// channel,非同步訊息接收與回應
// 處理來自ipcRenderer.send的訊息
ipcMain.on('web-to-main-send-channel', (event, args) => {
  logger.log('info', '[web-to-main-send-channel]Received %s from web', args.msg)
  setTimeout(() => {
    event.reply('web-to-main-send-channel', 'web-to-main-send-reply-msg')
  }, args.targetTime)
})

// channel,同步訊息接收與回應
// 處理來自ipcRenderer.sendSync的訊息
ipcMain.on('web-to-main-sendSync-channel', (event, args) => {
  logger.log('info', '[web-to-main-sendSync-channel]Received %s from web', args.msg)
  setTimeout(() => {
    event.returnValue = 'web-to-main-sendSync-reply-msg'
  }, args.targetTime)
})

// channel,非同步訊息接收與回應
// 處理來自ipcRenderer.invoke的訊息
ipcMain.handle('web-to-main-invoke-channel', async (event, args) => {
  logger.log('info', '[web-to-main-invoke-channel]Received %s from web', args.msg)
  await new Promise((resolve) => setTimeout(resolve, args.targetTime))
  return 'web-to-main-invoke-reply-msg'
})

// MessagePorts機制
// preload.js會發送port2過來,在此處進行port2接收動作
ipcMain.on('MessagePorts-tab1', (e, msg) => {
  logger.log('debug', msg)
  // logger.log('debug', 'e:%s', e)
  // logger.log('debug', 'msg:%s', msg)
  const [messagePort] = e.ports
  // logger.log('debug', 'messagePort:%s', messagePort)
  messagePort.start()
  // MessagePortMain必須使用on,而非onmessage
  // prot2 receive message from port1
  messagePort.on('message', (event) => {
    // logger.log('debug', event)
    logger.log('info', '[MessagePorts][tab1][port2 get message from port1]:%s', event.data)
  })

  global.share.messagePortTab1 = messagePort

  logger.log('debug', '[MessagePorts][tab1]init ok,have MessageChannel port2')
})

ipcMain.on('MessagePorts-tab2', (e, msg) => {
  logger.log('debug', msg)
  // logger.log('debug', 'e:%s', e)
  // logger.log('debug', 'msg:%s', msg)
  const [messagePort] = e.ports
  // logger.log('debug', 'messagePort:%s', messagePort)
  messagePort.start()
  // MessagePortMain必須使用on,而非onmessage
  // prot2 receive message from port1
  messagePort.on('message', (event) => {
    // logger.log('debug', event)
    logger.log('info', '[MessagePorts][tab2][port2 get message from port1]:%s', event.data)
  })

  global.share.messagePortTab2 = messagePort

  logger.log('debug', '[MessagePorts][tab2]init ok,have MessageChannel port2')
})
