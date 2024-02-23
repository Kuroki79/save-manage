<script setup lang="ts">
import { useIpcRenderer } from '@vueuse/electron';
import { onMounted, ref } from 'vue';

// enable nodeIntegration if you don't provide ipcRenderer explicitly
// @see: https://www.electronjs.org/docs/api/webview-tag#nodeintegration
const ipcRenderer = useIpcRenderer();

let defaultPath = ref('');
let targetPath = ref('');
let folderName = ref('');

function createFolder() {
  ipcRenderer.send('create-folder', { basePath: defaultPath.value, folderName: folderName.value });
}

function copyFiles() {
  ipcRenderer.send('copy-file', { source: defaultPath.value, destination: targetPath.value });
}

function copyFolder() {
  ipcRenderer.send('copy-folder', { source: defaultPath.value, destination: targetPath.value });
}

function renameFiles() {
  ipcRenderer.send('rename-file', { basePath: defaultPath.value, oldName: targetPath.value, newName: folderName.value });
}

function getDirList() {
  ipcRenderer.send('get-dir-list', targetPath.value);
  ipcRenderer.on('getDirList', (e, path) => {
    console.log(path);
  });
}

function setDefaultFolder() {
  ipcRenderer.send('chose-directory-dialog', { prop: 'openDirectory', action: 'selectedDefaultItem'});
  ipcRenderer.on('selectedDefaultItem', (e, files) => {
    console.log(files);
    defaultPath.value = files[0];
  });
}

function setTargetFolder() {
  ipcRenderer.send('chose-directory-dialog', { prop: 'openDirectory', action: 'selectedTargetItem'});
  ipcRenderer.on('selectedTargetItem', (e, files) => {
    console.log(files);
    targetPath.value = files[0];
  });
}

onMounted(() => {
});
</script>

<template>
  <div>
    <h1>文件处理测试</h1>
    <h2>默认目录：{{ defaultPath }}</h2>
    <h2>目标目录：{{ targetPath }}</h2>
    <button @click="setDefaultFolder">设置默认目录</button>
    <button @click="setTargetFolder">设置目标目录</button>
    <input type="text" v-model="folderName">
    <button @click="createFolder">创建文件夹</button>
    <button @click="copyFiles">复制文件</button>
    <button @click="copyFolder">复制文件夹</button>
    <button @click="renameFiles">重命名文件</button>
    <button @click="getDirList">获取指定目录下的文件</button>
  </div>
</template>
