"use strict";
const { app, BrowserWindow, Menu } = require("electron");
// const electronScreen=require("electron").screen;
//BrowserWindow未导出
let win;
function createWindow() {
    Menu.setApplicationMenu(null);
    // let screenSize=electronScreen.getPrimaryDisplay().size;
    // let h=screenSize.height*0.8;
    // let w=screenSize.width*0.8;
    win = new BrowserWindow({
        title: "three例子集",
        show: false,
        webPreferences: {
            nodeIntegration: true //这个特性开启之后,渲染进程才能够正常调用require方法获取模块
        },
        // height:h,
        // width:w,
        // minHeight:h,
        // minWidth:w,
        // maxHeight:h,
        // maxWidth:w,
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