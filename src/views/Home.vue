<template>
  <v-card v-if="saveList.length !== 0" class="mx-auto">
    <v-list select-strategy="classic" lines="two" @update:selected="updateListSelected">
      <v-list-item v-for="item in saveList" :key="item.id" :value="item" :title="item.name" :subtitle="item.location">
        <template v-slot:prepend="{ isActive }">
          <Transition name="slide-fade">
            <v-list-item-action v-if="multiCheckMode" start>
              <v-checkbox-btn :model-value="isActive"></v-checkbox-btn>
            </v-list-item-action>
          </Transition>

          <v-avatar class="list-avatar" :color="mainConfig.themeColor">
            <v-icon color="white">mdi-gamepad-variant</v-icon>
          </v-avatar>
        </template>

        <template v-slot:append>
          <v-btn v-if="!multiCheckMode" @click="() => toProfileDetail(item.id)" :color="mainConfig.themeColor"
            icon="mdi-information" variant="text"></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
  <placeholding-message message="暂无存档配置" v-else />

  <div class="control-area">
    <v-tooltip text="删除存档配置">
      <template v-slot:activator="{ props }">
        <Transition name="slide-fade">
          <v-btn v-if="multiCheckMode" v-bind="props" @click="confirmDialog = true" color="red-darken-2"
            icon="mdi-delete"></v-btn>
        </Transition>
      </template>
    </v-tooltip>
    <v-tooltip text="新建配置">
      <template v-slot:activator="{ props }">
        <v-btn @click="dialog = true" v-bind="props" :color="mainConfig.themeColor" icon="mdi-plus"></v-btn>
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
        <v-btn :color="mainConfig.themeColor" variant="text" @click="confirmDialog = false">
          否
        </v-btn>
        <v-btn color="red-darken-2" variant="text" @click="deleteProfile">
          是
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialog" persistent width="1024">
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
import { type SaveItemInter, type SaveListInter } from '../types/index';
import { usePrimaryConfigStore } from '../stores/primaryConfig';
import PlaceholdingMessage from '@/components/placeholdingMessage.vue';

const router = useRouter();

const { mainConfig, saveList, multiCheckMode } = storeToRefs(usePrimaryConfigStore());
const { addSaveProfile, changeSnackTextThenShow, deleteSaveProfile } = usePrimaryConfigStore();

const profileForm = ref();
const listSelected = ref<SaveListInter>([]);

const initialProfile = (): SaveItemInter => ({
  id: '',
  name: '',
  dirName: '',
  location: '',
  createTime: '',
  historyBackupList: [],
  isOnlyOverwrite: true
});

const confirmDialog = ref<boolean>(false);
const isDeleteFile = ref<boolean>(false);

let dialog = ref<boolean>(false);

let newProfileConfig = reactive<SaveItemInter>(initialProfile());

async function selectBackupFolder() {
  const res = await window.electronAPI.selectFolder();
  if (res.success) {
    newProfileConfig.location = res.data as string;
  }
}

async function saveNewProfile() {
  // 表单验证
  const { valid } = await profileForm.value.validate();

  if (!valid) return;

  newProfileConfig.dirName = newProfileConfig.dirName.length !== 0 ? newProfileConfig.dirName : newProfileConfig.name;

  const res = await window.electronAPI.createFolder({ basePath: mainConfig.value.saveFolder, folderName: newProfileConfig.dirName });

  if (res.success) {
    addSaveProfile(newProfileConfig);
    Object.assign(newProfileConfig, initialProfile());
    dialog.value = false;
  }

  changeSnackTextThenShow(res.message);
}

async function deleteProfile() {
  listSelected.value.forEach(async element => {
    if (isDeleteFile.value) {
      const res = await window.electronAPI.deleteFolder([mainConfig.value.saveFolder, element.dirName]);

      if (!res.success) {
        changeSnackTextThenShow(res.message);
        return;
      };
    }

    deleteSaveProfile(element.id);
  });

  confirmDialog.value = false;
}

function updateListSelected(arr: unknown) {
  listSelected.value = arr as SaveListInter;
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

.list-avatar{
  transition: all .2s ease-in-out;
}

.v-list-item .v-list-item__overlay {
  background: transparent !important;
}

.v-list-item--variant-text .v-list-item__overlay {
  background: transparent !important;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  /* transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1); */
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>