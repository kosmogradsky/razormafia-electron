const { app, BrowserWindow } = require("electron");
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
  });

  win.loadFile(path.resolve(__dirname, "index.html"));
  win.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
});
