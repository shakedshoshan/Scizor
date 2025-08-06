const { app, BrowserWindow } = require('electron');
const { MainWindow } = require('./src/main_window');

let mainWindow = null;

const createWindow = () => {
  mainWindow = new MainWindow();
  mainWindow.show();
};

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});