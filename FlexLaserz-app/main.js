const {app, BrowserWindow} = require('electron')
    const url = require("url");
    const path = require("path");

    function createWindow () {
      const mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
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