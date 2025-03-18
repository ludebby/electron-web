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
    send: (channel, data) => {
      // whitelist channels
      const validChannels = ['web-to-main-send-channel']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
      } else {
        console.log('[warn]', 'channel invalid:' + channel)
      }
    },
    onReceive: (channel, func) => {
      const validChannels = ['web-to-main-send-channel', 'main-to-web-send-channel']
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        // 處理來自webContents.send或event.reply的訊息
        ipcRenderer.on(channel, (event, ...args) => func(...args))
      } else {
        console.log('[warn]', 'channel invalid:' + channel)
      }
    },
    sendSync: (channel, data) => {
      const validChannels = ['web-to-main-sendSync-channel']
      if (validChannels.includes(channel)) {
        return ipcRenderer.sendSync(channel, data)
      } else {
        console.log('[warn]', 'channel invalid:' + channel)
      }
    },
    invoke: (channel, data) => {
      const validChannels = ['web-to-main-invoke-channel']
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data)
      } else {
        console.log('[warn]', 'channel invalid:' + channel)
      }
    },
    /*
    以上測試web與main的各種底層傳遞訊息方式
    實務上不會直接使用以上方式
    而採用如下方callHttpService等方法,用invoke,並封裝channel name,讓web端程式可以簡單呼叫
    */
    // -------------------------------- //
    onTabActive: (func) => {
      ipcRenderer.on('tab-active', (event, ...args) => func(...args))
    },
    testOpenView: () => {
      return ipcRenderer.invoke('testOpenView', '')
    },
    testOpenWindow: () => {
      return ipcRenderer.invoke('testOpenWindow', '')
    },
    setSharedState: (data) => {
      ipcRenderer.send('setSharedState', data)
    },
    getSharedState: () => {
      return ipcRenderer.invoke('getSharedState', '')
    },
    callHttpService: (data) => {
      return ipcRenderer.invoke('callHttpService', data)
    },
    // ------------------ //
    callRealmDbCreate: () => {
      return ipcRenderer.invoke('callRealmDbCreate', '')
    },
    callRealmDbRead: () => {
      return ipcRenderer.invoke('callRealmDbRead', '')
    },
    callRealmDbUpdate: (data) => {
      return ipcRenderer.invoke('callRealmDbUpdate', data)
    },
    callRealmDbDelete: () => {
      return ipcRenderer.invoke('callRealmDbDelete', '')
    },
    callRealmDbTypesTest: () => {
      return ipcRenderer.invoke('callRealmDbTypesTest', '')
    },
    // ------------------ //
    callLocalDbSelect: () => {
      return ipcRenderer.invoke('callLocalDbSelect', '')
    },
    callLocalDbUpdate: (data) => {
      return ipcRenderer.invoke('callLocalDbUpdate', data)
    },
    // ------------------ //
    openFile: () => {
      return ipcRenderer.invoke('openFile', '')
    },
    openDir: () => {
      return ipcRenderer.invoke('openDir', '')
    },
    saveFile: () => {
      return ipcRenderer.invoke('saveFile', '')
    },
    showMessageBox: (type, title, message) => {
      return ipcRenderer.invoke('showMessageBox', { type: type, title: title, message: message })
    },
    showErrorBox: (title, message) => {
      return ipcRenderer.invoke('showErrorBox', { title: title, message: message })
    },
    showConfirmMessageBox: (title, message) => {
      return ipcRenderer.invoke('showConfirmMessageBox', { title: title, message: message })
    },
    logError: (message) => {
      return ipcRenderer.invoke('logError', { message: message })
    },
    showNotification: (title, body) => {
      return ipcRenderer.invoke('showNotification', { title, body })
    },
    getEnvVersionInfo: () => {
      return { chrome: process.versions.chrome, electron: process.versions.electron }
    }
  }
)
