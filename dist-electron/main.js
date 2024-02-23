"use strict";
const path = require("path");
const electron = require("electron");
const fs = require("fs");
function createFolder(folderName) {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
}
function renameFile(oldName, newName) {
  fs.renameSync(oldName, newName);
}
function deleteFile(fileName) {
  fs.unlinkSync(fileName);
}
function deleteFolder(folderName) {
  if (fs.existsSync(folderName)) {
    fs.rmSync(folderName, { recursive: true });
  }
}
function deleteFolderFile(folderName) {
  if (fs.existsSync(folderName)) {
    getDirList(folderName).forEach((file) => {
      const curPath = path.join(folderName, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        deleteFile(curPath);
      }
    });
  }
}
function copyFile(source, destination) {
  fs.copyFileSync(source, destination);
}
function copyFolder(source, destination) {
  fs.cpSync(source, destination, { recursive: true });
}
function getDirList(folderName) {
  return fs.readdirSync(folderName);
}
electron.app.whenReady().then(async () => {
  const win = new electron.BrowserWindow({
    title: "Main window",
    frame: false,
    show: false,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js")
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile("dist/index.html");
  }
  win.once("ready-to-show", () => {
    win.show();
  });
  win.on("maximize", () => {
    win.webContents.send("onMaximize");
  });
  win.on("unmaximize", () => {
    win.webContents.send("onUnmaximize");
  });
  electron.ipcMain.on("window-action", (e, arg) => {
    switch (arg) {
      case "min":
        win.minimize();
        break;
      case "max":
        win.maximize();
        break;
      case "restore":
        win.restore();
        break;
      case "close":
        win.close();
        break;
    }
  });
  electron.ipcMain.on("create-folder", (e, arg) => {
    try {
      createFolder(path.join(arg.basePath, arg.folderName));
    } catch (e2) {
      console.log(e2);
    }
  });
  electron.ipcMain.on("rename-file", (e, arg) => {
    renameFile(arg.oldName, path.join(arg.basePath, arg.newName));
  });
  electron.ipcMain.on("chose-directory-dialog", (e, arg) => {
    electron.dialog.showOpenDialog({
      properties: [arg.prop],
      title: "请选择默认目录",
      buttonLabel: "选择"
    }).then((result) => {
      console.log(result);
      if (result.canceled)
        return;
      e.sender.send(arg.action, result.filePaths);
    });
  });
  electron.ipcMain.on("get-dir-list", (e, arg) => {
    e.sender.send("getDirList", getDirList(arg));
  });
  electron.ipcMain.on("create-backup", (e, arg) => {
    const newBackupFolderPath = path.join(arg.basePath, arg.folderName, arg.createTime);
    try {
      createFolder(newBackupFolderPath);
      copyFolder(arg.source, newBackupFolderPath);
      win.webContents.send("file-operation", "创建备份成功");
    } catch (e2) {
      console.log(e2);
    }
  });
  electron.ipcMain.on("restore-backup", (e, arg) => {
    const sourcePath = path.join(arg.basePath, arg.folderName, arg.createTime);
    try {
      copyFolder(sourcePath, arg.destination);
      win.webContents.send("file-operation", "还原备份成功");
    } catch (e2) {
      console.log(e2);
    }
  });
  electron.ipcMain.on("delete-backup", (e, arg) => {
    try {
      deleteFolder(path.join(arg.basePath, arg.folderName, arg.createTime));
      win.webContents.send("file-operation", "删除备份成功");
    } catch (e2) {
      console.log(e2);
    }
  });
  electron.ipcMain.on("delete-profile", (e, arg) => {
    try {
      deleteFolder(path.join(arg.basePath, arg.folderName));
    } catch (e2) {
      console.log(e2);
    }
  });
  electron.ipcMain.on("clean-folder-then-restore", (e, arg) => {
    const sourcePath = path.join(arg.basePath, arg.folderName, arg.createTime);
    try {
      deleteFolderFile(arg.destination);
      copyFolder(sourcePath, arg.destination);
      win.webContents.send("file-operation", "还原备份成功");
    } catch (e2) {
      console.log(e2);
    }
  });
  electron.ipcMain.on("copy-file", (e, arg) => {
    copyFile(arg.source, arg.destination);
  });
  electron.ipcMain.on("copy-folder", (e, arg) => {
    copyFolder(arg.source, arg.destination);
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
