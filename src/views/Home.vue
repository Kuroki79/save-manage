<template>
  <v-card v-if="saveList.length !== 0" class="mx-auto">
    <v-list lines="two">
      <v-list-item v-for="item in saveList" :key="item.id" :title="item.name" :subtitle="item.location">
        <template v-slot:prepend>
          <v-avatar :color="themeColor">
            <v-icon color="white">mdi-gamepad-variant</v-icon>
          </v-avatar>
        </template>

        <template v-slot:append>
          <v-btn @click="() => toProfileDetail(item.id)" :color="themeColor" icon="mdi-information"
            variant="text"></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
  <placeholding-message message="暂无存档配置" v-else />

  <v-dialog v-model="dialog" persistent width="1024">
    <template v-slot:activator="{ props }">
      <v-btn class="add-btn" v-bind="props" :color="themeColor" icon="mdi-plus"></v-btn>
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
              <v-text-field v-model="newProfileConfig.dirName" hint="留空时以配置名称为主" persistent-hint
                label="备份文件夹名称"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="newProfileConfig.location" label="存档路径" @click:control="selectBackupFolder"
                readonly required></v-text-field>
            </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-text-field type="number" v-model="newProfileConfig.autoBackupTime" label="自动备份时间间隔" hint="单位为小时"
                persistent-hint required disabled></v-text-field>
            </v-col>
            <v-col cols="12" sm="8" md="6">
              <v-switch :color="themeColor" v-model="newProfileConfig.isOnlyOverwrite"
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
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { type SaveItemInter } from '../types/index';
import { usePrimaryConfigStore } from '../stores/primaryConfig';
import PlaceholdingMessage from '@/components/placeholdingMessage.vue';

const router = useRouter();

const { themeColor, saveFolder, saveList } = storeToRefs(usePrimaryConfigStore());
const { addSaveProfile, changeSnackTextThenShow } = usePrimaryConfigStore();

const initialProfile = (): SaveItemInter => ({
  id: '',
  name: '',
  dirName: '',
  location: '',
  createTime: '',
  autoBackupTime: 0,
  historyBackupList: [],
  isOnlyOverwrite: true
});

let dialog = ref<boolean>(false);

let newProfileConfig = reactive<SaveItemInter>(initialProfile());

async function selectBackupFolder() {
  const filePath = await window.electronAPI.selectFolder();
  if (filePath) {
    newProfileConfig.location = filePath;
  }
}

async function saveNewProfile() {
  newProfileConfig.dirName = newProfileConfig.dirName.length !== 0 ? newProfileConfig.dirName : newProfileConfig.name;

  const msg = await window.electronAPI.createFolder({ basePath: saveFolder.value, folderName: newProfileConfig.dirName });

  changeSnackTextThenShow(msg);

  if (msg === '文件夹创建成功') {
    addSaveProfile(newProfileConfig);
    Object.assign(newProfileConfig, initialProfile());
    dialog.value = false;
  }
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