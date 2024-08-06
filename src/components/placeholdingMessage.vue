<template>
  <div class="placeholding-message">
    <v-icon :color="color" icon="mdi-alert-circle" :size="iconSize"></v-icon>
    <p :style="{ fontSize }">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">

withDefaults(defineProps<{ message: string, icon?: string, color?: string, iconSize?: string, fontSize?: string}>(), {
  message: '暂无数据',
  icon: 'mdi-alert-circle',
  color: 'primary',
  iconSize: '64',
  fontSize: '24px',
});
</script>

<style scoped>
.placeholding-message{
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.placeholding-message p{
  margin: 5px 0;
  color: #000000DE;
}
</style>