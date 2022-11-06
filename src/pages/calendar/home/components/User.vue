<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { Person20Regular as UserIcon } from "@vicons/fluent";

import useGlobalStore from "@/stores/global";

enum UserSelectEnum {
  "CHANGE_INFO",
  "LOGOUT",
  "ABOUT",
}
const selectOptions = [
  {
    label: "设置",
    value: UserSelectEnum.CHANGE_INFO,
  },
  {
    label: "关于",
    value: UserSelectEnum.ABOUT,
  },
  {
    label: "退出登录",
    value: UserSelectEnum.LOGOUT,
  },
] as const;

const router = useRouter();
const globalStore = useGlobalStore();

const selectVale = ref<string>("");

const handleChange = (key: number) => {
  switch (key) {
    case UserSelectEnum.LOGOUT:
      globalStore.handleLogout();
      window.$message.success("退出成功");
      router.push({
        name: "homePage",
      });
      break;
    case UserSelectEnum.CHANGE_INFO:
      router.push({
        path: "/setting",
      });
      break;

    default:
      break;
  }
};
</script>
<template>
  <section class="mx-auto cursor-pointer mb-5">
    <n-popselect
      v-model:value="selectVale"
      :options="selectOptions"
      trigger="click"
      :on-update:value="handleChange"
    >
      <n-avatar
        v-if="globalStore.userInfo?.avatar"
        round
        :src="globalStore.userInfo?.avatar"
      />
      <n-avatar v-else round>
        <n-icon class="text-base">
          <UserIcon />
        </n-icon>
      </n-avatar>
    </n-popselect>
  </section>
</template>
