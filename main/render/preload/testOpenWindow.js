const {
  contextBridge,
  ipcRenderer
} = require('electron')

console.log('testOpenWindow preload.js')
console.log('process.type:', process.type)
console.log('process.contextIsolated:', process.contextIsolated)

contextBridge.exposeInMainWorld(
  'api', {
    closeTestOpenWindow: () => {
      return ipcRenderer.invoke('closeTestOpenWindow', '')
    },
    // 監聽electron事件
    onInitData: (func) => {
      ipcRenderer.on('initData', (event, ...args) => func(...args))
    }
  }
)
