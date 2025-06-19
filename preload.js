const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any specific APIs if needed in the future
  platform: process.platform,
  version: process.versions.electron
});

// Prevent access to Node.js APIs
window.addEventListener('DOMContentLoaded', () => {
  // Remove any Node.js globals that might be available
  delete window.require;
  delete window.exports;
  delete window.module;
}); 