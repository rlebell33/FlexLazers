const {app, BrowserWindow, screen, ipcMain} = require('electron')
    const url = require("url");
    const path = require("path");

    let mainWindow

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

    function openModal(){
      const { BrowserWindow } = require('electron');
      let modal = new BrowserWindow({ 
        parent: mainWindow, 
        modal: true, 
        show: false,
        alwaysOnTop: true, 
      })
      modal.loadURL('https://www.sitepoint.com')
      modal.once('ready-to-show', () => {
        modal.show()
      })
    }

    ipcMain.on('openModal', (event, arg) => {
      openModal()
    })

    app.on('ready', createWindow)

    app.on('window-all-closed', function () {
      if (process.platform !== 'darwin') app.quit()
    })

    app.on('activate', function () {
      if (mainWindow === null) createWindow()
    })