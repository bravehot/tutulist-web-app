<script setup lang="ts">
import { onMounted } from "vue";
import { useMessage } from "naive-ui";

const message = useMessage();

onMounted(() => {
  window.$message = message;
});
</script>
<template>{{}}</template>
