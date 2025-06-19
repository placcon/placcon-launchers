const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

const mode = process.env.PLACCON_MODE || 'app';
const env = process.env.PLACCON_ENV || 'prod';

let url = 'https://core.placcon.com';
if (env === 'test') {
  url = 'https://test.core.placcon.com';
}

function createDisplayWindow() {
  const { bounds } = screen.getPrimaryDisplay();
  const win = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    fullscreen: true,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadURL(url);
  win.setFullScreen(true);
}

function createAppWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadURL(url);
}

app.whenReady().then(() => {
  if (mode === 'display') {
    createDisplayWindow();
  } else {
    createAppWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (mode === 'display') {
        createDisplayWindow();
      } else {
        createAppWindow();
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 