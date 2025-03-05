const {
  contextBridge,
  ipcRenderer
} = require('electron')

console.log('my preload.js')
console.log('process.type:', process.type)
console.log('process.contextIsolated:', process.contextIsolated)

window.onload = () => {
  // MessagePorts機制
  const { port1, port2 } = new MessageChannel()
  // 傳port1給web
  window.postMessage('[MessagePorts][tab1]init msg for web', '*', [port1])
  // 傳port2給main
  ipcRenderer.postMessage('MessagePorts-tab1', '[MessagePorts][tab1]init msg for main', [port2])
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
// 控制畫面端可以傳遞給main.js的訊息
contextBridge.exposeInMainWorld(
  'api', {
    selectEntrance: (vendor) => ipcRenderer.send('select-entrance', vendor),
    onSelectEntrance: (func) => {
      ipcRenderer.on('entrance', (event, ...args) => func(...args))
    },
    openEntranceList: (detail) => ipcRenderer.send('open-entranceList', detail)
  }
)
