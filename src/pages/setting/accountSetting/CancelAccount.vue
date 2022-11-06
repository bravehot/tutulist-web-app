<script setup lang="ts">
import { userCancellation } from "@/service/user";
import useGlobalStore from "@/stores/global";
import { useRouter } from "vue-router";

const globalStore = useGlobalStore();
const router = useRouter();

const handlePositiveClick = async () => {
  const { code } = await userCancellation();
  if (code === 200) {
    router.push({
      name: "homePage",
    });
    globalStore.handleLogout();
    window.$message.success("欢迎下次再来！！！");
  }
};
</script>
<template>
  <n-card title="注销账号" class="mb-5">
    <p class="mb-5">注销账号后，该账号信息将不会保留，请谨慎操作</p>
    <n-popconfirm
      :positive-button-props="{
        type: 'error',
      }"
      @positive-click="handlePositiveClick"
    >
      <template #trigger>
        <n-button type="error" class="!w-20"> 注 销 </n-button>
      </template>
      确认注销该账号
    </n-popconfirm>
  </n-card>
</template>
<style scoped></style>
