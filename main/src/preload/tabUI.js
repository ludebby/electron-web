const {
  contextBridge,
  ipcRenderer
} = require('electron')

console.log('tabUI preload.js')
console.log('process.type:', process.type)
console.log('process.contextIsolated:', process.contextIsolated)

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
// 控制畫面端可以傳遞給main.js的訊息
contextBridge.exposeInMainWorld(
  'api', {
    switchTab: (tab) => ipcRenderer.send('switch-tab', tab)
  }
)
