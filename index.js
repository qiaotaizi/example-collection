"use strict";
const { app, BrowserWindow, Menu } = require("electron");
//BrowserWindow类型未导出,这里无法明确给出定义win的类型
let win;
function createWindow() {
    //Menu.setApplicationMenu(null);
    win = new BrowserWindow({
        title: "three例子集",
        show: false,
        webPreferences: {
            nodeIntegration: true,
        },
        autoHideMenuBar: true,
        resizable: false,
        maximizable: false,
    });
    win.maximize();
    win.loadFile("app.html");
    //打开开发者工具
    win.webContents.openDevTools();
    win.once('ready-to-show', () => {
        win.show();
    });
    win.on("closed", () => {
        win = null;
    });
}
app.on("ready", createWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});
//# sourceMappingURL=index.js.map