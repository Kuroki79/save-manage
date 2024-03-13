<template>
  <form>
    <v-text-field @click:control="selectFolder" :color="themeColor" hint="用于设置存档的保存路径" persistent-hint
      readonly label="保存路径" v-model="saveFolder" required></v-text-field>
  </form>
</template>

<script setup lang="ts">
// import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePrimaryConfigStore } from '../stores/primaryConfig';

const { themeColor, saveFolder } = storeToRefs(usePrimaryConfigStore());

async function selectFolder() {
  const filePath = await window.electronAPI.selectFolder();
  if (filePath) {
    saveFolder.value = filePath;
  }
}
</script>

<style scoped></style>