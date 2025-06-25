const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script starting...');

// Expose display management API to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  setDisplay: (displayIndex) => ipcRenderer.invoke('set-display', displayIndex)
});

console.log('electronAPI exposed to window');

// Test if the API is working
setTimeout(() => {
  console.log('Testing electronAPI availability...');
  if (typeof window !== 'undefined' && window.electronAPI) {
    console.log('electronAPI is available in window');
  } else {
    console.log('electronAPI is NOT available in window');
  }
}, 1000);

// Simple display selector injection
window.addEventListener('load', () => {
  console.log('Page loaded, initializing display selector...');
  
  // Add keyboard shortcut listener
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      console.log('Keyboard shortcut detected, opening display selector...');
      showDisplaySelector();
    }
  });

  // Add display selector button after a delay
  setTimeout(() => {
    addDisplaySelectorButton();
  }, 3000); // Wait 3 seconds for page to fully load
});

// Show display selector function
async function showDisplaySelector() {
  console.log('Opening display selector...');
  
  // Check if electronAPI is available
  if (!window.electronAPI) {
    console.error('electronAPI not available in showDisplaySelector');
    alert('Error: electronAPI not available. Please restart the application.');
    return;
  }
  
  try {
    console.log('Calling getDisplays...');
    const { success, displays, currentDisplay, error } = await window.electronAPI.getDisplays();
    console.log('getDisplays result:', { success, displays, currentDisplay, error });
    
    if (!success) {
      alert('Error loading displays: ' + error);
      return;
    }
    
    if (displays.length === 0) {
      alert('No displays found.');
      return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'displaySelectorModal';
    modal.style.cssText = `
      position: fixed;
      z-index: 9999;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.8);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    modal.innerHTML = `
      <div style="background-color: white; margin: auto; padding: 0; border-radius: 12px; width: 90%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
        <div style="padding: 20px 24px; border-bottom: 1px solid #e9ecef; background-color: #f8f9fa; border-top-left-radius: 12px; border-top-right-radius: 12px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">Display Selection</h2>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">Select which display to use for the order display application</p>
        </div>
        <div style="padding: 24px;">
          <div id="displayList" style="min-height: 200px; max-height: 300px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px;"></div>
        </div>
        <div style="padding: 16px 24px; text-align: right; border-top: 1px solid #e9ecef; background-color: #f8f9fa; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
          <button id="cancelDisplaySelect" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;">Cancel</button>
          <button id="applyDisplayBtn" disabled style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-left: 10px; font-size: 14px;">Apply & Restart</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const displayList = document.getElementById('displayList');
    const applyBtn = document.getElementById('applyDisplayBtn');
    const cancelBtn = document.getElementById('cancelDisplaySelect');
    let selectedDisplayIndex = null;
    
    // Populate display list
    displayList.innerHTML = displays.map((display, index) => `
      <div class="display-item" data-index="${display.index}" style="padding: 16px; border-bottom: 1px solid #f1f3f4; cursor: pointer; transition: background-color 0.2s;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 500; color: #333;">${display.label}</div>
            <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">
              Position: (${display.bounds.x}, ${display.bounds.y}) | 
              Scale: ${display.scaleFactor}x | 
              ${display.primary ? 'Primary' : 'Secondary'}
            </div>
          </div>
          ${display.index === currentDisplay ? '<span style="color: #28a745; font-weight: 600;">✓ Current</span>' : ''}
        </div>
      </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.display-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.display-item').forEach(i => i.style.background = 'transparent');
        item.style.background = '#e3f2fd';
        selectedDisplayIndex = parseInt(item.dataset.index);
        applyBtn.disabled = false;
      });
    });
    
    // Select current display by default
    const currentItem = document.querySelector(`[data-index="${currentDisplay}"]`);
    if (currentItem) {
      currentItem.style.background = '#e3f2fd';
      selectedDisplayIndex = currentDisplay;
      applyBtn.disabled = false;
    }
    
    // Add button handlers
    applyBtn.addEventListener('click', async () => {
      if (selectedDisplayIndex !== null) {
        try {
          console.log('Setting display to:', selectedDisplayIndex);
          const result = await window.electronAPI.setDisplay(selectedDisplayIndex);
          console.log('setDisplay result:', result);
          if (result.success) {
            displayList.innerHTML = '<div style="padding: 40px; text-align: center; color: #28a745;">✓ ' + result.message + '</div>';
            setTimeout(() => {
              document.body.removeChild(modal);
            }, 2000);
          } else {
            displayList.innerHTML = '<div style="padding: 20px; color: red;">Error: ' + result.error + '</div>';
          }
        } catch (error) {
          console.error('Error setting display:', error);
          displayList.innerHTML = '<div style="padding: 20px; color: red;">Error: ' + error.message + '</div>';
        }
      }
    });
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close on outside click
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
  } catch (error) {
    console.error('Error showing display selector:', error);
    alert('Error showing display selector: ' + error.message);
  }
}

// Add display selector button
function addDisplaySelectorButton() {
  if (document.getElementById('displaySelectorBtn')) return;
  
  const button = document.createElement('button');
  button.id = 'displaySelectorBtn';
  button.innerHTML = '⚙️ Display';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9998;
    background: rgba(0, 123, 255, 0.9);
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: background-color 0.2s;
  `;
  
  button.addEventListener('mouseenter', () => {
    button.style.background = 'rgba(0, 123, 255, 1)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.background = 'rgba(0, 123, 255, 0.9)';
  });
  
  button.addEventListener('click', () => {
    console.log('Display button clicked');
    showDisplaySelector();
  });
  document.body.appendChild(button);
  
  console.log('Display selector button added');
} 