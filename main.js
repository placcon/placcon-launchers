const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const noble = require('@abandonware/noble');

// Keep a global reference of the window object
let mainWindow;

// Serial port state
let serialPortInstance = null;

// Bluetooth device state
let bluetoothDevices = [];
let isScanning = false;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Allow Web Bluetooth API
      experimentalFeatures: true // Enable experimental features
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'Placcon Launcher',
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

  // Enable Web Bluetooth API
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'bluetooth') {
      callback(true); // Allow Bluetooth
    } else {
      callback(false);
    }
  });

  // Set Bluetooth permissions
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'bluetooth') {
      return true;
    }
    return false;
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

// List available Bluetooth devices
ipcMain.handle('bluetooth-scan', async () => {
  try {
    console.log('Bluetooth scan requested, current state:', noble.state);
    
    if (isScanning) {
      console.log('Already scanning, returning current devices');
      return { success: true, devices: bluetoothDevices };
    }

    // Check if Bluetooth is powered on
    if (noble.state !== 'poweredOn') {
      console.log('Bluetooth not ready, state:', noble.state);
      return { success: false, error: `Bluetooth is not ready. Current state: ${noble.state}. Please enable Bluetooth and try again.` };
    }

    bluetoothDevices = [];
    isScanning = true;
    console.log('Starting Bluetooth scan...');

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('Bluetooth scan timeout, stopping scan');
        noble.stopScanning();
        isScanning = false;
        resolve({ success: true, devices: bluetoothDevices });
      }, 10000); // 10 second timeout

      const onDiscover = (peripheral) => {
        console.log('Bluetooth device discovered:', peripheral.advertisement.localName || peripheral.advertisement.name);
        const device = {
          id: peripheral.id,
          address: peripheral.address,
          addressType: peripheral.addressType,
          connectable: peripheral.connectable,
          advertisement: peripheral.advertisement,
          rssi: peripheral.rssi,
          name: peripheral.advertisement.localName || peripheral.advertisement.name || 'Unknown Device'
        };
        
        // Check if device is already in list
        const existingIndex = bluetoothDevices.findIndex(d => d.id === device.id);
        if (existingIndex >= 0) {
          bluetoothDevices[existingIndex] = device;
        } else {
          bluetoothDevices.push(device);
        }
      };

      const onScanStop = () => {
        console.log('Bluetooth scan stopped, found devices:', bluetoothDevices.length);
        clearTimeout(timeout);
        isScanning = false;
        noble.removeListener('discover', onDiscover);
        noble.removeListener('scanStop', onScanStop);
        resolve({ success: true, devices: bluetoothDevices });
      };

      noble.on('discover', onDiscover);
      noble.on('scanStop', onScanStop);

      noble.startScanning([], true);
    });
  } catch (error) {
    console.error('Bluetooth scan error:', error);
    isScanning = false;
    return { success: false, error: error.message };
  }
});

// Stop Bluetooth scanning
ipcMain.handle('bluetooth-stop-scan', async () => {
  try {
    if (isScanning) {
      noble.stopScanning();
      isScanning = false;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get current Bluetooth devices
ipcMain.handle('bluetooth-get-devices', async () => {
  try {
    return { success: true, devices: bluetoothDevices };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// App event handlers
app.whenReady().then(() => {
  // Initialize noble (Bluetooth)
  console.log('Initializing Bluetooth...');
  console.log('Initial Bluetooth state:', noble.state);
  
  noble.on('stateChange', (state) => {
    console.log('Bluetooth state changed:', state);
    if (state === 'poweredOn') {
      console.log('Bluetooth is ready for scanning');
    } else if (state === 'poweredOff') {
      console.log('Bluetooth is powered off - please enable Bluetooth');
    } else if (state === 'unauthorized') {
      console.log('Bluetooth access is unauthorized - please grant permissions');
    } else if (state === 'unsupported') {
      console.log('Bluetooth is not supported on this device');
    } else {
      console.log('Bluetooth is not ready:', state);
    }
  });

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