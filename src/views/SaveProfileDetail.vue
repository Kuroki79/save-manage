<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">存档配置</span>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="newProfileConfig.name" label="配置名称" required></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="newProfileConfig.dirName" hint="留空时以配置名称为主" persistent-hint
              label="备份文件夹名称"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="newProfileConfig.location" label="存档路径" @click:control="selectBackupFolder" readonly
              required></v-text-field>
          </v-col>
          <v-col cols="12" sm="4" md="2">
            <v-text-field type="number" v-model="newProfileConfig.autoBackupTime" label="自动备份时间间隔" hint="单位为小时"
              persistent-hint required disabled></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-switch :color="primaryConfigStore.themeColor" v-model="newProfileConfig.isContainGame"
              label="存档路径中是否包含游戏文件" disabled></v-switch>
          </v-col>
          <v-col cols="12" sm="8" md="6">
            <v-switch :color="primaryConfigStore.themeColor" v-model="newProfileConfig.isOnlyOverwrite"
              :label="`存档还原方式：${newProfileConfig.isOnlyOverwrite ? '仅覆盖' : '清空目录后覆盖'}`"></v-switch>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue-darken-1" variant="text" @click="saveProfile">
        保存
      </v-btn>
    </v-card-actions>
  </v-card>
  <v-card class="mt-4">
    <v-card-title>
      <span class="text-h5">历史备份</span>
    </v-card-title>
    <v-list lines="two">
      <v-list-item v-for="item in primaryConfigStore.saveList[targetProfileIndex].historyBackupList"
        :key="item.createTime" :title="item.createTime" :subtitle="item.note">
        <template v-slot:prepend>
          <v-avatar :color="primaryConfigStore.themeColor">
            <v-icon color="white">mdi-history</v-icon>
          </v-avatar>
        </template>

        <template v-slot:append>
          <v-tooltip text="删除历史备份">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" @click="() => deleteHistoryBackup(item.createTime)" color="red-accent-4"
                icon="mdi-delete-forever" variant="text"></v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="还原备份">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" @click="() => restoreBackup(item.createTime)" color="blue" icon="mdi-backup-restore"
                variant="text"></v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
  <div class="control-area">
    <v-tooltip text="删除存档配置">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" @click="confirmDialog = true" color="red-darken-2" icon="mdi-delete"></v-btn>
      </template>
    </v-tooltip>
    <v-tooltip text="新建历史备份">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" @click="createBackupDialog = true" :color="primaryConfigStore.themeColor"
          icon="mdi-content-save-plus"></v-btn>
      </template>
    </v-tooltip>
  </div>

  <v-dialog v-model="confirmDialog" persistent width="auto">
    <v-card>
      <v-card-title>
        确认删除存档配置？
      </v-card-title>
      <v-card-text>
        <v-checkbox v-model="isDeleteFile" label="是否删除本地文件"></v-checkbox>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="primaryConfigStore.themeColor" variant="text" @click="confirmDialog = false">
          否
        </v-btn>
        <v-btn color="red-darken-2" variant="text" @click="deleteProfile">
          是
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="createBackupDialog" persistent width="512">
    <v-card>
      <v-card-title class="text-h5">
        历史备份配置
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="backupNote" label="备注"></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="primaryConfigStore.themeColor" variant="text" @click="createBackupDialog = false">
          否
        </v-btn>
        <v-btn color="red-darken-2" variant="text" @click="createNewBackup">
          是
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar :timeout="3000" v-model="snackbar">
    {{ snackBarText }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useIpcRenderer } from '@vueuse/electron';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { type SaveItemInter } from '../types/index';
import { usePrimaryConfigStore } from '../stores/primaryConfig';

const route = useRoute();
const router = useRouter();

const primaryConfigStore = usePrimaryConfigStore();

const ipcRenderer = useIpcRenderer();

const confirmDialog = ref<boolean>(false);

const createBackupDialog = ref<boolean>(false);

const snackbar = ref<boolean>(false);

const isDeleteFile = ref<boolean>(false);

const backupNote = ref<string>('');

const snackBarText = ref<string>('');

const targetProfileIndex: number = primaryConfigStore.saveList.findIndex(item => item.id === route.params.id);

const initialProfile = (): SaveItemInter => (primaryConfigStore.saveList[targetProfileIndex]);

let newProfileConfig = reactive<SaveItemInter>(initialProfile());

ipcRenderer.on('file-operation', (e, msg) => {
  snackBarText.value = msg;
  snackbar.value = true;
});

ipcRenderer.on('selectedBackupFolderAlter', (e, files) => {
  console.log(files);
  newProfileConfig.location = files[0];
});

function selectBackupFolder() {
  ipcRenderer.send('chose-directory-dialog', { prop: 'openDirectory', action: 'selectedBackupFolderAlter' });
}

function saveProfile() {
  primaryConfigStore.saveList[targetProfileIndex].name = newProfileConfig.name;
  primaryConfigStore.saveList[targetProfileIndex].location = newProfileConfig.location;
  primaryConfigStore.saveList[targetProfileIndex].dirName = newProfileConfig.dirName;
  primaryConfigStore.saveList[targetProfileIndex].autoBackupTime = newProfileConfig.autoBackupTime;
  primaryConfigStore.saveList[targetProfileIndex].isContainGame = newProfileConfig.isContainGame;
  primaryConfigStore.saveList[targetProfileIndex].isOnlyOverwrite = newProfileConfig.isOnlyOverwrite;

  snackBarText.value = '配置已保存';
  snackbar.value = true;
}

function createNewBackup() {
  const createTime = dayjs().format('YYYYMMDD HHmmss');
  primaryConfigStore.addHistoryBackup(newProfileConfig.id, { createTime, note: backupNote.value });
  ipcRenderer.send('create-backup', { createTime, basePath: primaryConfigStore.saveFolder, folderName: newProfileConfig.name, source: newProfileConfig.location });
  backupNote.value = '';
  createBackupDialog.value = false;
}

function restoreBackup(createTime: string) {
  if (newProfileConfig.isOnlyOverwrite) {
    ipcRenderer.send('restore-backup', { createTime, basePath: primaryConfigStore.saveFolder, folderName: newProfileConfig.name, destination: newProfileConfig.location });
  } else {
    ipcRenderer.send('clean-folder-then-restore', { createTime, basePath: primaryConfigStore.saveFolder, folderName: newProfileConfig.name, destination: newProfileConfig.location });
  }
}

function deleteHistoryBackup(createTime: string) {
  primaryConfigStore.deleteHistoryBackup(newProfileConfig.id, createTime);
  ipcRenderer.send('delete-backup', { createTime, basePath: primaryConfigStore.saveFolder, folderName: newProfileConfig.name });
}

function deleteProfile() {
  primaryConfigStore.deleteSaveProfile(newProfileConfig.id);
  if (isDeleteFile.value) {
    ipcRenderer.send('delete-profile', { basePath: primaryConfigStore.saveFolder, folderName: newProfileConfig.name });
  }
  confirmDialog.value = false;
  router.replace({ name: 'home' });
}
</script>

<style scoped>
.control-area {
  position: absolute;
  right: 32px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
}

.control-area button {
  margin: 10px 0;
}
</style>