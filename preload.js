const { contextBridge, ipcRenderer } = require('electron');

// Ez az egyetlen feladata a preload.js-nek:
// Biztonságos hidat képez a böngésző (renderer) és a Node.js (main) között.
contextBridge.exposeInMainWorld('electronAPI', {
  listPorts: () => ipcRenderer.invoke('serialport-list'),
  openPort: (path, baudRate) => ipcRenderer.invoke('serialport-open', { path, baudRate }),
  writePort: (data) => ipcRenderer.invoke('serialport-write', data),
  closePort: () => ipcRenderer.invoke('serialport-close')
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
        this.readable = new ReadableStream({
          start: (controller) => {
            window.addEventListener('electron-serial-data', (event) => controller.enqueue(event.detail), { signal: this.abortController.signal });
          }
        });
        this.writable = new WritableStream({
          write: chunk => window.electronAPI.writePort(chunk)
        });
      }
      async open({ baudRate }) { return window.electronAPI.openPort(this.path, baudRate); }
      async close() {
        this.abortController.abort();
        return window.electronAPI.closePort();
      }
      getInfo() { return { usbVendorId: undefined, usbProductId: undefined }; }
    }

    const customRequestPort = () => {
      // console.log('[Placcon Launcher] Overridden requestPort called!');
      return new Promise((resolve, reject) => {
        if (!document.getElementById('electronPortSelectorModal')) {
          const modalHTML = \`
            <div id="electronPortSelectorModal" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; align-items: center; justify-content: center;">
              <div style="background-color: white; margin: auto; padding: 0; border-radius: 12px; width: 90%; max-width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: placcon-modal-appear 0.3s ease-out;">
                <div style="padding: 20px 24px; border-bottom: 1px solid #e9ecef;"><h2 style="margin: 0; font-size: 18px; font-weight: 600;">Select a Serial Port</h2></div>
                <div style="padding: 24px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <span style="font-size: 14px; color: #555;">Available ports:</span>
                    <button id="refreshPortsBtn" style="background: transparent; border: 1px solid #007bff; color: #007bff; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px;">Refresh</button>
                  </div>
                  <div id="electronPortList" style="min-height: 150px; max-height: 250px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px;"></div>
                </div>
                <div style="padding: 16px 24px; text-align: right; border-top: 1px solid #e9ecef; background-color: #f8f9fa; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                  <button id="cancelPortSelect" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;">Cancel</button>
                  <button id="connectPortBtn" disabled style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-left: 10px; font-size: 14px;">Connect</button>
                </div>
              </div>
            </div>
            <style> @keyframes placcon-modal-appear { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } </style>
          \`;
          const div = document.createElement('div');
          div.innerHTML = modalHTML;
          document.body.appendChild(div);
        }

        const modal = document.getElementById('electronPortSelectorModal');
        const portListDiv = document.getElementById('electronPortList');
        const connectBtn = document.getElementById('connectPortBtn');
        const cancelBtn = document.getElementById('cancelPortSelect');
        const refreshBtn = document.getElementById('refreshPortsBtn');
        let selectedPortPath = null;

        const cleanup = () => { if (modal) modal.style.display = 'none'; };

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
                    connectBtn.disabled = false;
                });
            });
        };
        
        connectBtn.addEventListener('click', () => {
            if (selectedPortPath) { cleanup(); resolve(new SerialPortPolyfill(selectedPortPath)); }
        });

        cancelBtn.addEventListener('click', () => {
            cleanup();
            reject(new DOMException('User aborted.', 'AbortError'));
        });

        refreshBtn.addEventListener('click', updatePortList);
        
        modal.style.display = 'flex';
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