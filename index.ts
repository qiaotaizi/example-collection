const {app,BrowserWindow}=require("electron");

let win:any;

function createWindow() {
    win=new BrowserWindow({
        title:"three例子集",
        show:false,
        webPreferences: {
            nodeIntegration: true//这个特性开启之后,渲染进程才能够正常调用require方法获取模块
        },
    });
    win.maximize();
    win.loadFile("app.html");
    win.once();

    //打开开发者工具
    win.webContents.openDevTools();

    win.on("closed",()=>{
        win=null;
    })
}

app.on("ready",createWindow);

app.on("window-all-closed",()=>{
    if(process.platform!=="darwin"){
        app.quit();
    }
});

app.on("activate",()=>{
    if(win===null){
        createWindow();
    }
});


