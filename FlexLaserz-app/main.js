const {app, BrowserWindow, screen} = require('electron')
    const url = require("url");
    const path = require("path");

    function createWindow () {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize
      const mainWindow = new BrowserWindow({
        width: width,
        height: height,
        alwaysOnTop: true,
        frame:false,
        transparent: true,
        webPreferences: {
          nodeIntegration: true
        }
      })
      
      mainWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, `/dist/FlexLaserz-app/index.html`),
          protocol: "file:",
          slashes: true
        })
      );
      // Open the DevTools.
      //mainWindow.webContents.openDevTools()

      mainWindow.on('closed', function () {
        mainWindow = null
      })
    }

    app.on('ready', createWindow)

    app.on('window-all-closed', function () {
      if (process.platform !== 'darwin') app.quit()
    })

    app.on('activate', function () {
      if (mainWindow === null) createWindow()
    })