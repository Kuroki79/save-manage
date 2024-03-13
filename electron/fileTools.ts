import path from 'path';

const fs = require('fs');
// const path = require("path");

function createFolder(folderName: string) {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  } else {
    throw Error('文件夹已存在');
  }
}

function renameFileAndFolder(oldName: string, newName: string) {
  fs.renameSync(oldName, newName);
}

function deleteFile(fileName: string) {
  fs.unlinkSync(fileName);
}

function deleteFolder(folderName: string) {
  if (fs.existsSync(folderName)) {
    fs.rmSync(folderName, { recursive: true });
  } else {
    throw Error('文件夹不存在');
  }
}

function deleteFolderFile(folderName: string) {
  if (fs.existsSync(folderName)) {
    getDirList(folderName).forEach((file: string) => {
      const curPath = path.join(folderName, file);

      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        //删除文件或文件夹
        deleteFile(curPath);
      }
    });
  } else {
    throw Error('文件或文件夹不存在');
  }
}

function copyFile(source: string, destination: string) {
  fs.copyFileSync(source, destination);
}

function copyFolder(source: string, destination: string) {
  fs.cpSync(source, destination, { recursive: true });
}

function writeFile(fileName: string, content: string) {
  fs.writeFileSync(fileName, content);
}

function readFile(fileName: string) {
  return fs.readFileSync(fileName, 'utf-8');
}

function getDirList(folderName: string) {
  return fs.readdirSync(folderName);
}

export {
  createFolder,
  renameFileAndFolder,
  deleteFile,
  deleteFolder,
  deleteFolderFile,
  copyFile,
  writeFile,
  readFile,
  getDirList,
  copyFolder
};
