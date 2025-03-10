const {
  contextBridge,
  ipcRenderer
} = require('electron')

console.log('logViewer preload.js')
console.log('process.type:', process.type)
console.log('process.contextIsolated:', process.contextIsolated)

contextBridge.exposeInMainWorld(
  'api', {
    // 監聽electron showLog事件
    onShowLog: (func) => {
      ipcRenderer.on('showLog', (event, ...args) => func(...args))
    }
  }
)
