const { contextBridge, ipcRenderer } = require('electron');

console.log('Simple preload script loaded');

// Expose API
contextBridge.exposeInMainWorld('electronAPI', {
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  setDisplay: (displayIndex) => ipcRenderer.invoke('set-display', displayIndex)
});

console.log('API exposed to window'); 