const {
  contextBridge,
  ipcRenderer
} = require('electron')

/**
Preload scripts contain code that executes in a renderer process before its web contents begin loading.
These scripts run within the renderer context,
but are granted more privileges by having access to Node.js APIs

A BrowserWindow's preload script runs in a context that has access to both the HTML DOM and a limited subset of Node.js and Electron APIs.

Context isolation is a security measure in Electron that ensures that your preload script cannot leak
privileged Electron or Node.js APIs to the web contents in your renderer process. With context isolation enabled,
the only way to expose APIs from your preload script is through the contextBridge API.
 */

// web端(renderer process)載入前會執行此preload.js內容

console.log('tab1 preload.js')
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
    openEntranceList: (detail) => ipcRenderer.send('open-entranceList', detail),
    goBack: (page) => ipcRenderer.send('goback', page)
  }
)
