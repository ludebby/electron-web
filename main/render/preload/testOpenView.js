const {
  contextBridge,
  ipcRenderer
} = require('electron')

console.log('testOpenView preload.js')
console.log('process.type:', process.type)
console.log('process.contextIsolated:', process.contextIsolated)

contextBridge.exposeInMainWorld(
  'api', {
    closeTestOpenView: () => {
      return ipcRenderer.invoke('closeTestOpenView', '')
    },
    // 監聽electron事件
    onInitData: (func) => {
      ipcRenderer.on('initData', (event, ...args) => func(...args))
    }
  }
)
