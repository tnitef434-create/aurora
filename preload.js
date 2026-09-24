const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('game', {
  quit: () => ipcRenderer.send('quit'),
  setFullscreen: on => ipcRenderer.send('fullscreen', on)
});
