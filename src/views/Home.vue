<template>
  <v-card v-if="saveList.length !== 0" class="mx-auto">
    <v-list lines="two">
      <v-list-item v-for="item in saveList" :key="item.id" :title="item.name" :subtitle="item.location">
        <template v-slot:prepend>
          <v-avatar :color="mainConfig.themeColor">
            <v-icon color="white">mdi-gamepad-variant</v-icon>
          </v-avatar>
        </template>

        <template v-slot:append>
          <v-btn @click="() => toProfileDetail(item.id)" :color="mainConfig.themeColor" icon="mdi-information"
            variant="text"></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
  <placeholding-message message="暂无存档配置" v-else />

  <v-dialog v-model="dialog" persistent width="1024">
    <template v-slot:activator="{ props }">
      <v-btn class="add-btn" v-bind="props" :color="mainConfig.themeColor" icon="mdi-plus"></v-btn>
    </template>
    <v-card title="新建配置">
      <template v-slot:prepend>
        <v-icon :color="mainConfig.themeColor" icon="mdi-content-save-plus"></v-icon>
      </template>
      <v-form ref="profileForm">
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field :rules="[v => !!v || '配置名称不能为空！',]" v-model="newProfileConfig.name"
                  label="配置名称"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="newProfileConfig.dirName" hint="留空时以配置名称为主" persistent-hint
                  label="备份文件夹名称"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field :rules="[v => !!v || '存档路径不能为空！',]" v-model="newProfileConfig.location" label="存档路径"
                  @click:control="selectBackupFolder" readonly></v-text-field>
              </v-col>
              <v-col cols="12" sm="8" md="6">
                <v-switch :color="mainConfig.themeColor" v-model="newProfileConfig.isOnlyOverwrite"
                  :label="`存档还原方式：${newProfileConfig.isOnlyOverwrite ? '仅覆盖' : '清空目录后覆盖'}`"></v-switch>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">
            关闭
          </v-btn>
          <v-btn :color="mainConfig.themeColor" variant="tonal" @click="saveNewProfile">
            保存
          </v-btn>
        </v-card-actions>
      </v-form>
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

const { mainConfig, saveList } = storeToRefs(usePrimaryConfigStore());
const { addSaveProfile, changeSnackTextThenShow } = usePrimaryConfigStore();

const profileForm = ref();

const initialProfile = (): SaveItemInter => ({
  id: '',
  name: '',
  dirName: '',
  location: '',
  createTime: '',
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
  // 表单验证
  const { valid } = await profileForm.value.validate();

  if (!valid) return;

  newProfileConfig.dirName = newProfileConfig.dirName.length !== 0 ? newProfileConfig.dirName : newProfileConfig.name;

  const msg = await window.electronAPI.createFolder({ basePath: mainConfig.value.saveFolder, folderName: newProfileConfig.dirName });

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