const {app, BrowserWindow, Menu} = require("electron");

//BrowserWindow类型未导出,这里无法明确给出定义win的类型
let win: any;

function createWindow() {
    //Menu.setApplicationMenu(null);
    win = new BrowserWindow({
        title: "three例子集",
        show: false,//暂不展示,当应用准备就绪时展示
        webPreferences: {
            nodeIntegration: true,//这个特性开启之后,渲染进程才能够正常调用require方法获取模块
        },
        autoHideMenuBar:true,
        resizable: false,//不可改变大小
        maximizable: false,//最大化按钮失效

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
    })
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
