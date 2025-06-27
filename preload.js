const { contextBridge, ipcRenderer } = require('electron');

// Ez az egyetlen feladata a preload.js-nek:
// Biztonságos hidat képez a böngésző (renderer) és a Node.js (main) között.
contextBridge.exposeInMainWorld('electronAPI', {
  listPorts: () => ipcRenderer.invoke('serialport-list'),
  openPort: (path, baudRate) => ipcRenderer.invoke('serialport-open', { path, baudRate }),
  writePort: (data) => ipcRenderer.invoke('serialport-write', data),
  closePort: () => ipcRenderer.invoke('serialport-close'),
  // Bluetooth API
  bluetoothScan: () => ipcRenderer.invoke('bluetooth-scan'),
  bluetoothStopScan: () => ipcRenderer.invoke('bluetooth-stop-scan'),
  bluetoothGetDevices: () => ipcRenderer.invoke('bluetooth-get-devices')
});

// Esemény a folyamatos adatküldéshez a main processből a renderer felé
ipcRenderer.on('serialport-data', (event, data) => {
  window.dispatchEvent(new CustomEvent('electron-serial-data', { detail: data }));
});

// 2. A teljes logika, amit a weboldal kontextusába injektálunk.
const injectedScript = `
  (() => {
    // console.log('[Placcon Launcher] Preparing to override Serial API...');

    class SerialPortPolyfill {
      constructor(path) {
        this.path = path;
        this.abortController = new AbortController();
        this.isBluetooth = path.startsWith('bluetooth://');
        this.bluetoothDevice = null;
        
        this.readable = new ReadableStream({
          start: (controller) => {
            window.addEventListener('electron-serial-data', (event) => controller.enqueue(event.detail), { signal: this.abortController.signal });
          }
        });
        
        this.writable = new WritableStream({
          write: chunk => {
            if (this.isBluetooth) {
              return this.writeToBluetooth(chunk);
            } else {
              return window.electronAPI.writePort(chunk);
            }
          }
        });
      }
      
      async writeToBluetooth(chunk) {
        if (this.bluetoothDevice) {
          // Write to Bluetooth device
          // This would need to be implemented based on the specific Bluetooth service
          console.log('Writing to Bluetooth device:', this.bluetoothDevice.name, chunk);
          return Promise.resolve();
        }
        throw new Error('Bluetooth device not connected');
      }
      
      async open({ baudRate }) { 
        if (this.isBluetooth) {
          // Extract device ID from path (bluetooth://address)
          const address = this.path.replace('bluetooth://', '');
          const device = bluetoothDevices.find(d => d.address === address);
          if (device) {
            try {
              // For now, just store the device reference
              // Actual Bluetooth connection would require more implementation
              console.log('Connecting to Bluetooth device:', device.name);
              this.bluetoothDevice = device;
              return { success: true };
            } catch (error) {
              throw new Error(\`Failed to connect to Bluetooth device: \${error.message}\`);
            }
          } else {
            throw new Error('Bluetooth device not found');
          }
        }
        return window.electronAPI.openPort(this.path, baudRate); 
      }
      
      async close() {
        this.abortController.abort();
        if (this.isBluetooth && this.bluetoothDevice) {
          // For Web Bluetooth API, we would disconnect here
          // For now, just clean up the reference
          console.log('Disconnecting from Bluetooth device:', this.bluetoothDevice.name);
          this.bluetoothDevice = null;
          return Promise.resolve();
        }
        return window.electronAPI.closePort();
      }
      
      getInfo() { 
        if (this.deviceInfo) {
          return { 
            usbVendorId: undefined, 
            usbProductId: undefined,
            bluetoothDevice: this.deviceInfo 
          }; 
        }
        return { usbVendorId: undefined, usbProductId: undefined }; 
      }
    }

    // Global variable to store Bluetooth devices
    let bluetoothDevices = [];

    const customRequestPort = () => {
      // console.log('[Placcon Launcher] Overridden requestPort called!');
      return new Promise((resolve, reject) => {
        if (!document.getElementById('electronPortSelectorModal')) {
          const modalHTML = \`
            <div id="electronPortSelectorModal" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; align-items: center; justify-content: center;">
              <div style="background-color: white; margin: auto; padding: 0; border-radius: 12px; width: 90%; max-width: 480px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: placcon-modal-appear 0.3s ease-out;">
                <div style="padding: 20px 24px; border-bottom: 1px solid #e9ecef;">
                  <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Select a Device</h2>
                </div>
                
                <!-- Tabs -->
                <div style="display: flex; border-bottom: 1px solid #e9ecef;">
                  <button id="serialTab" class="device-tab active" style="flex: 1; padding: 12px; background: #007bff; color: white; border: none; cursor: pointer; font-size: 14px;">Serial Ports</button>
                  <button id="bluetoothTab" class="device-tab" style="flex: 1; padding: 12px; background: #f8f9fa; color: #495057; border: none; cursor: pointer; font-size: 14px;">Bluetooth</button>
                </div>
                
                <div style="padding: 24px;">
                  <!-- Serial Ports Section -->
                  <div id="serialSection" class="device-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                      <span style="font-size: 14px; color: #555;">Available serial ports:</span>
                      <button id="refreshPortsBtn" style="background: transparent; border: 1px solid #007bff; color: #007bff; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px;">Refresh</button>
                    </div>
                    <div id="electronPortList" style="min-height: 150px; max-height: 250px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px;"></div>
                  </div>
                  
                  <!-- Bluetooth Section -->
                  <div id="bluetoothSection" class="device-section" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                      <span style="font-size: 14px; color: #555;">Available Bluetooth devices:</span>
                      <button id="refreshBluetoothBtn" style="background: transparent; border: 1px solid #007bff; color: #007bff; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px;">Scan</button>
                    </div>
                    <div id="bluetoothDeviceList" style="min-height: 150px; max-height: 250px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px;"></div>
                  </div>
                </div>
                
                <div style="padding: 16px 24px; text-align: right; border-top: 1px solid #e9ecef; background-color: #f8f9fa; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                  <button id="cancelPortSelect" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;">Cancel</button>
                  <button id="connectPortBtn" disabled style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-left: 10px; font-size: 14px;">Connect</button>
                </div>
              </div>
            </div>
            <style> 
              @keyframes placcon-modal-appear { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
              .device-tab.active { background: #007bff !important; color: white !important; }
              .device-tab:not(.active) { background: #f8f9fa !important; color: #495057 !important; }
            </style>
          \`;
          const div = document.createElement('div');
          div.innerHTML = modalHTML;
          document.body.appendChild(div);
        }

        const modal = document.getElementById('electronPortSelectorModal');
        const portListDiv = document.getElementById('electronPortList');
        const bluetoothDeviceListDiv = document.getElementById('bluetoothDeviceList');
        const connectBtn = document.getElementById('connectPortBtn');
        const cancelBtn = document.getElementById('cancelPortSelect');
        const refreshBtn = document.getElementById('refreshPortsBtn');
        const refreshBluetoothBtn = document.getElementById('refreshBluetoothBtn');
        const serialTab = document.getElementById('serialTab');
        const bluetoothTab = document.getElementById('bluetoothTab');
        const serialSection = document.getElementById('serialSection');
        const bluetoothSection = document.getElementById('bluetoothSection');
        let selectedPortPath = null;
        let selectedBluetoothDevice = null;
        let currentTab = 'serial';

        const cleanup = () => { if (modal) modal.style.display = 'none'; };

        // Tab switching logic
        serialTab.addEventListener('click', () => {
          currentTab = 'serial';
          serialTab.classList.add('active');
          bluetoothTab.classList.remove('active');
          serialSection.style.display = 'block';
          bluetoothSection.style.display = 'none';
          connectBtn.disabled = !selectedPortPath;
        });

        bluetoothTab.addEventListener('click', () => {
          currentTab = 'bluetooth';
          bluetoothTab.classList.add('active');
          serialTab.classList.remove('active');
          bluetoothSection.style.display = 'block';
          serialSection.style.display = 'none';
          connectBtn.disabled = !selectedBluetoothDevice;
          // Auto-scan for Bluetooth devices when tab is selected
          updateBluetoothDeviceList();
        });

        const updatePortList = async () => {
            portListDiv.innerHTML = '<div style="padding: 40px; text-align: center; color: #888;">Scanning...</div>';
            const { success, ports, error } = await window.electronAPI.listPorts();
            if (!success) { portListDiv.innerHTML = \`<div style="padding: 20px; color: red;">Error: \${error}</div>\`; return; }
            if (ports.length === 0) { portListDiv.innerHTML = '<div style="padding: 40px; text-align: center; color: #888;">No ports found.</div>'; return; }
            
            portListDiv.innerHTML = ports.map(p => \`
                <div class="port-item" data-path="\${p.path}" style="padding: 12px 16px; border-bottom: 1px solid #f1f3f4; cursor: pointer;">
                    <div style="font-weight: 500;">\${p.path}</div>
                    <div style="font-size: 12px; color: #6c757d;">\${p.manufacturer || 'Unknown'}</div>
                </div>\`).join('');

            document.querySelectorAll('.port-item').forEach(item => {
                item.addEventListener('click', () => {
                    document.querySelectorAll('.port-item').forEach(i => i.style.background = 'transparent');
                    item.style.background = '#e3f2fd';
                    selectedPortPath = item.dataset.path;
                    selectedBluetoothDevice = null;
                    connectBtn.disabled = false;
                });
            });
        };

        const updateBluetoothDeviceList = async () => {
            bluetoothDeviceListDiv.innerHTML = '<div style="padding: 40px; text-align: center; color: #888;">Scanning for Bluetooth devices...</div>';
            try {
                console.log('Starting Bluetooth scan...');
                const { success, devices, error } = await window.electronAPI.bluetoothScan();
                console.log('Bluetooth scan result:', { success, devices, error });
                
                if (!success) { 
                    bluetoothDeviceListDiv.innerHTML = \`<div style="padding: 20px; color: red;">Error: \${error}</div>\`; 
                    return; 
                }
                
                // Store devices globally
                bluetoothDevices = devices || [];
                console.log('Bluetooth devices found:', bluetoothDevices.length);
                
                if (devices.length === 0) { 
                    bluetoothDeviceListDiv.innerHTML = '<div style="padding: 40px; text-align: center; color: #888;">No Bluetooth devices found. Make sure Bluetooth is enabled and devices are discoverable.</div>'; 
                    return; 
                }
                
                bluetoothDeviceListDiv.innerHTML = devices.map(device => \`
                    <div class="bluetooth-item" data-device-id="\${device.id}" style="padding: 12px 16px; border-bottom: 1px solid #f1f3f4; cursor: pointer;">
                        <div style="font-weight: 500;">\${device.name}</div>
                        <div style="font-size: 12px; color: #6c757d;">\${device.address} (RSSI: \${device.rssi}dBm)</div>
                        <div style="font-size: 11px; color: #999;">\${device.connectable ? 'Connectable' : 'Not connectable'}</div>
                    </div>\`).join('');

                document.querySelectorAll('.bluetooth-item').forEach(item => {
                    item.addEventListener('click', () => {
                        document.querySelectorAll('.bluetooth-item').forEach(i => i.style.background = 'transparent');
                        item.style.background = '#e3f2fd';
                        selectedBluetoothDevice = item.dataset.deviceId;
                        selectedPortPath = null;
                        connectBtn.disabled = false;
                    });
                });
            } catch (error) {
                console.error('Bluetooth scan error:', error);
                bluetoothDeviceListDiv.innerHTML = \`<div style="padding: 20px; color: red;">Failed to scan: \${error.message}</div>\`;
            }
        };
        
        connectBtn.addEventListener('click', () => {
            if (currentTab === 'serial' && selectedPortPath) {
                cleanup();
                resolve(new SerialPortPolyfill(selectedPortPath));
            } else if (currentTab === 'bluetooth' && selectedBluetoothDevice) {
                cleanup();
                // For Bluetooth devices, we'll create a special polyfill
                const bluetoothDevice = bluetoothDevices.find(d => d.id === selectedBluetoothDevice);
                if (bluetoothDevice) {
                    const bluetoothPolyfill = new SerialPortPolyfill(\`bluetooth://\${bluetoothDevice.address}\`);
                    bluetoothPolyfill.deviceInfo = bluetoothDevice;
                    bluetoothPolyfill.bluetoothDevice = bluetoothDevice; // Store the device reference
                    resolve(bluetoothPolyfill);
                } else {
                    reject(new Error('Selected Bluetooth device not found'));
                }
            }
        });

        cancelBtn.addEventListener('click', () => {
            cleanup();
            reject(new DOMException('User aborted.', 'AbortError'));
        });

        refreshBtn.addEventListener('click', updatePortList);
        refreshBluetoothBtn.addEventListener('click', updateBluetoothDeviceList);
        
        modal.style.display = 'flex';
        // Ensure serial section is visible by default
        serialSection.style.display = 'block';
        bluetoothSection.style.display = 'none';
        currentTab = 'serial';
        updatePortList();
      });
    };
    
    function performOverride() {
      if (!navigator.serial) return;
      navigator.serial.requestPort = customRequestPort;
      // console.log('[Placcon Launcher] navigator.serial.requestPort has been overridden.');
      window.dispatchEvent(new Event('placcon-serial-ready'));
    }

    const interval = setInterval(() => {
      if (navigator.serial) {
        clearInterval(interval);
        performOverride();
      }
    }, 5);
  })();
`;

// 3. Időzítés-biztos injektálás egy MutationObserver segítségével.
const observer = new MutationObserver(() => {
  if (document.documentElement) {
    const script = document.createElement('script');
    script.textContent = injectedScript;
    document.documentElement.insertBefore(script, document.documentElement.firstChild);
    script.remove();
    observer.disconnect();
  }
});

observer.observe(document, { childList: true, subtree: true }); 