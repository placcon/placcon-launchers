const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');

// Keep a global reference of the window object
let mainWindow;

// Serial port state
let serialPortInstance = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    fullscreen: true,
    kiosk: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'placcon order display',
    show: false, // Don't show until ready
    autoHideMenuBar: true, // Hide menu bar
    titleBarStyle: 'default'
  });

  // Load the Placcon website
  mainWindow.loadURL('https://test.core.placcon.com');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent new window creation (block popups)
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Handle navigation to external sites
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.hostname !== 'test.core.placcon.com') {
      event.preventDefault();
      // Optionally open in default browser
      require('electron').shell.openExternal(navigationUrl);
    }
  });

  // Handle new window requests
  mainWindow.webContents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.hostname !== 'test.core.placcon.com') {
      require('electron').shell.openExternal(navigationUrl);
    }
  });

  // Handle uncaught exceptions in renderer process
  mainWindow.webContents.on('crashed', (event) => {
    console.error('Renderer process crashed:', event);
    // Reload the window instead of crashing the app
    mainWindow.reload();
  });

  // Handle unresponsive renderer
  mainWindow.on('unresponsive', () => {
    console.warn('Window became unresponsive');
  });

  // Handle responsive renderer
  mainWindow.on('responsive', () => {
    console.log('Window became responsive');
  });
}

// Configure session for persistent storage and Serial API permissions
function configureSession() {
  // Enable persistent storage
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    // Add any custom headers if needed
    callback({ requestHeaders: details.requestHeaders });
  });
}

// List available serial ports
ipcMain.handle('serialport-list', async () => {
  try {
    const ports = await SerialPort.list();
    return { success: true, ports };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Open a serial port
ipcMain.handle('serialport-open', async (event, { path, baudRate }) => {
  try {
    if (serialPortInstance && serialPortInstance.isOpen) {
      await new Promise((resolve, reject) => serialPortInstance.close(err => err ? reject(err) : resolve()));
    }
    serialPortInstance = new SerialPort({ path, baudRate });

    // Folyamatos adatküldés beállítása a renderer felé
    serialPortInstance.on('data', data => {
      mainWindow.webContents.send('serialport-data', data);
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to open serial port:', error);
    return { success: false, error: error.message };
  }
});

// Write to serial port
ipcMain.handle('serialport-write', async (event, data) => {
  try {
    if (!serialPortInstance || !serialPortInstance.isOpen) throw new Error('Port not open');
    await new Promise((resolve, reject) => serialPortInstance.write(data, err => err ? reject(err) : resolve()));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Close serial port
ipcMain.handle('serialport-close', async () => {
  try {
    if (serialPortInstance && serialPortInstance.isOpen) {
      await new Promise((resolve, reject) => serialPortInstance.close(err => err ? reject(err) : resolve()));
    }
    serialPortInstance = null;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// App event handlers
app.whenReady().then(() => {
  // Add this diagnostic check
  SerialPort.list().then(ports => {
    console.log('--- Serial Port Diagnostics (main process) ---');
    if (ports.length > 0) {
      console.log('Ports found:', ports);
    } else {
      console.log('No serial ports found by node-serialport.');
    }
    console.log('------------------------------------------');
  }).catch(err => {
    console.error('Error listing ports in main process:', err);
  });

  configureSession();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent navigation to file:// URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.protocol === 'file:') {
      event.preventDefault();
    }
  });
});

// Handle app activation (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 