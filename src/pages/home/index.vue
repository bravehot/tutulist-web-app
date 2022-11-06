<script setup lang="ts">
import { ref, toRefs, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { Person20Regular as UserIcon } from "@vicons/fluent";

import logo from "@/assets/logo/Tu.png";
import LoginByPassword from "./LoginByPassword.vue";
import LoginByCode from "./LoginByCode.vue";
import RegisterUser from "./RegisterUser.vue";
import ResetPassword from "./ResetPassword.vue";
import Context from "./Context.vue";

import useGlobalStore from "@/stores/global";

import type { LoginTabsType } from "@/types/user";

enum SelectEnum {
  ACCOUNT = "ACCOUNT",
  LOGOUT = "LOGOUT",
}

const USER_SELECT_OPTIONS = [
  {
    label: "设置",
    key: SelectEnum.ACCOUNT,
  },
  {
    label: "退出登录",
    key: SelectEnum.LOGOUT,
  },
];

const globalStore = useGlobalStore();
const router = useRouter();

const isLogin = ref<boolean>(false);
const loginModal = ref<boolean>(false);
const isForgetPwd = ref<boolean>(false);
const selectTabs = ref<LoginTabsType>("login");

const { userInfo } = toRefs(globalStore);

const handleSelect = (value: SelectEnum) => {
  switch (value) {
    case SelectEnum.ACCOUNT:
      router.push({
        name: "setting",
      });
      break;
    case SelectEnum.LOGOUT:
      handleLogout();
      break;
  }
};

const handleLoginModalVisiable = (type: LoginTabsType) => {
  loginModal.value = !loginModal.value;
  handleSelectTabs(type);
};

const handleSelectTabs = (value: LoginTabsType) => {
  selectTabs.value = value;
};

const handleLogout = () => {
  globalStore.handleLogout();
  isLogin.value = false;
  window.$message.success("退出成功");
};

const goToWorkSpace = () => {
  router.push({
    name: "home",
  });
};

const handleForget = (value: boolean) => {
  isForgetPwd.value = value;
};

watchEffect(() => {
  isLogin.value = Boolean(userInfo.value);
});
</script>

<template>
  <section class="w-screen">
    <n-layout>
      <header class="border-b border-gray-200 dark:border-gray-700 h-16 w-full">
        <section class="max-w-screen-xl h-full mx-auto flex items-center">
          <img :src="logo" class="w-14" />

          <section class="ml-auto flex items-center">
            <template v-if="isLogin">
              <n-button type="primary" class="!mr-5" @click="goToWorkSpace">
                前往工作台
              </n-button>
              <n-dropdown
                :options="USER_SELECT_OPTIONS"
                size="large"
                trigger="click"
                @select="handleSelect"
              >
                <n-avatar
                  v-if="!userInfo?.avatar"
                  round
                  class="cursor-pointer"
                  size="small"
                >
                  <n-icon>
                    <UserIcon />
                  </n-icon>
                </n-avatar>

                <n-avatar
                  v-else
                  class="cursor-pointer"
                  round
                  size="small"
                  :src="userInfo.avatar"
                />
              </n-dropdown>
            </template>
            <template v-else>
              <n-button
                class="!mr-6"
                @click="handleLoginModalVisiable('login')"
              >
                登录
              </n-button>
              <n-button
                type="primary"
                @click="handleLoginModalVisiable('register')"
              >
                免费注册
              </n-button>
            </template>
          </section>
        </section>
      </header>
      <Context @open-model="handleLoginModalVisiable" />
    </n-layout>
  </section>

  <n-modal
    v-model:show="loginModal"
    :style="{
      width: '460px',
    }"
  >
    <n-card
      v-if="isForgetPwd"
      title="重置密码"
      size="huge"
      :bordered="false"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>
        <span
          class="text-xs underline cursor-pointer text-gray-500 hover:text-gray-500/90 self-end"
          @click="handleForget(false)"
          >返回
        </span>
      </template>

      <ResetPassword @back="handleForget" />
    </n-card>

    <n-card
      v-else
      :title="`${selectTabs === 'login' ? '登录' : '注册'}您的账户`"
      size="huge"
      :bordered="false"
      role="dialog"
      aria-modal="true"
    >
      <n-tabs animated :on-update:value="handleSelectTabs" :value="selectTabs">
        <n-tab-pane name="login" tab="登录">
          <n-tabs type="segment" animated>
            <n-tab-pane name=" password" tab="账号密码登录">
              <LoginByPassword @update="handleForget" />
            </n-tab-pane>
            <n-tab-pane name="code" tab="手机验证码登录">
              <LoginByCode />
            </n-tab-pane>
          </n-tabs>
        </n-tab-pane>
        <n-tab-pane name="register" tab="注册">
          <RegisterUser @set-tabs="handleSelectTabs" />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </n-modal>
</template>
