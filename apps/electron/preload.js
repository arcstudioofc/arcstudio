const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('win:minimize'),
  maximize: () => ipcRenderer.send('win:toggle-maximize'),
  close: () => ipcRenderer.send('win:close'),

  isMaximized: () => ipcRenderer.invoke('win:is-maximized'),

  onMaximizeChange: (callback) => {
    ipcRenderer.on('win:maximize-change', callback)
  },

  onFullscreenChange: (callback) => {
    ipcRenderer.on('win:fullscreen-change', callback)
  }
})
