const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

function createWindow() {
  const win = new BrowserWindow({
    width: 1600, height: 900, fullscreen: true, frame: false, show: false,
    backgroundColor: '#0a0c11', autoHideMenuBar: true, title: 'Aurora',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, backgroundThrottling: false }
  });
  win.loadFile('index.html');
  win.once('ready-to-show', () => win.show());
  // F11 toggles fullscreen, like a game
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
}

ipcMain.on('quit', () => app.quit());
ipcMain.on('fullscreen', (_e, on) => { const w = BrowserWindow.getAllWindows()[0]; if (w) w.setFullScreen(!!on); });

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
