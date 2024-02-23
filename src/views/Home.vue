<template>
  <v-card class="mx-auto">
    <v-list lines="two">
      <v-list-item v-for="item in primaryConfigStore.saveList" :key="item.id" :title="item.name"
        :subtitle="item.location">
        <template v-slot:prepend>
          <v-avatar :color="primaryConfigStore.themeColor">
            <v-icon color="white">mdi-gamepad-variant</v-icon>
          </v-avatar>
        </template>

        <template v-slot:append>
          <v-btn @click="() => toProfileDetail(item.id)" :color="primaryConfigStore.themeColor" icon="mdi-information"
            variant="text"></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>

  <v-dialog v-model="dialog" persistent width="1024">
    <template v-slot:activator="{ props }">
      <v-btn class="add-btn" v-bind="props" :color="primaryConfigStore.themeColor" icon="mdi-plus"></v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">新建配置</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="newProfileConfig.name" label="配置名称" required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="newProfileConfig.dirName" hint="留空时以配置名称为主" persistent-hint label="备份文件夹名称"></v-text-field>
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
        <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
          关闭
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="saveNewProfile">
          保存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useIpcRenderer } from '@vueuse/electron';
import { useRouter } from 'vue-router';
import { type SaveItemInter } from '../types/index';
import { usePrimaryConfigStore } from '../stores/primaryConfig';

const router = useRouter();

const primaryConfigStore = usePrimaryConfigStore();

const ipcRenderer = useIpcRenderer();

const initialProfile = (): SaveItemInter => ({
  id: '',
  name: '',
  dirName: '',
  location: '',
  createTime: '',
  isContainGame: false,
  autoBackupTime: 0,
  historyBackupList: [],
  isOnlyOverwrite: true 
});

let dialog = ref<boolean>(false);

let newProfileConfig = reactive<SaveItemInter>(initialProfile());

ipcRenderer.on('selectedBackupFolder', (e, files) => {
  console.log(files);
  newProfileConfig.location = files[0];
});

function selectBackupFolder() {
  ipcRenderer.send('chose-directory-dialog', { prop: 'openDirectory', action: 'selectedBackupFolder' });
}

function saveNewProfile() {
  const folderName = newProfileConfig.dirName.length !== 0 ? newProfileConfig.dirName : newProfileConfig.name;
  primaryConfigStore.addSaveProfile(newProfileConfig);

  ipcRenderer.send('create-folder', { basePath: primaryConfigStore.saveFolder, folderName });

  Object.assign(newProfileConfig, initialProfile());

  dialog.value = false;
}

function toProfileDetail(id: string) {
  router.push({
    name: 'saveProfileDetail',
    params: {
    // query: {
      id,
    }
  });
}
</script>

<style scoped>
.add-btn {
  position: absolute;
  right: 20px;
  bottom: 20px;
}
</style>