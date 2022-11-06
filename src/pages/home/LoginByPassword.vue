<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { FormInst, FormItemRule } from "naive-ui";

import useGlobalStore from "@/stores/global";
import { loginByPassword } from "@/service/user";

import { UserTokenEnum } from "@/types/user";

const emits = defineEmits<{
  (e: "update", value: boolean): void;
}>();

const router = useRouter();
const globalStore = useGlobalStore();

const loginFormInfo = reactive({
  mobile: "",
  password: "",
});
const formRef = ref<FormInst | null>(null);

const loginLoading = ref(false);

const handleValidator = (_rule: FormItemRule, value: string) => {
  if (value) {
    const reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/;
    if (reg.test(value)) {
      return true;
    } else {
      return new Error("密码至少包含 数字和英文，长度6-20");
    }
  }

  return new Error("请输入密码");
};

const handleLoginByPassword = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loginLoading.value = true;
      const { code, data } = await loginByPassword(loginFormInfo);
      if (code == 200) {
        window.$message.success("登录成功");
        window.localStorage.setItem(
          UserTokenEnum.ASSET_TOKEN,
          data.accessToken
        );
        window.localStorage.setItem(
          UserTokenEnum.REFRESH_TOKEN,
          data.refreshToken
        );
        globalStore.getInitialInfo();
        router.push({
          name: "home",
        });
      }
      loginLoading.value = false;
    }
  });
};

const rules = {
  mobile: {
    key: "mobile",
    required: true,
    message: "请输入正确的手机号",
    trigger: ["input", "blur"],
    validator: (_rule: FormItemRule, value: string) => {
      const reg = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;
      return reg.test(value);
    },
  },
  password: {
    key: "password",
    min: 6,
    max: 20,
    required: true,
    validator: handleValidator,
    trigger: ["input", "blur"],
  },
};

const handleForget = () => {
  emits("update", true);
};
</script>

<template>
  <n-form
    ref="formRef"
    class="mt-2"
    :model="loginFormInfo"
    :show-label="false"
    :rules="rules"
  >
    <n-form-item path="mobile">
      <n-input
        v-model:value="loginFormInfo.mobile"
        :maxlength="11"
        placeholder="输入手机号"
      />
    </n-form-item>
    <n-form-item path="password">
      <n-input
        v-model:value="loginFormInfo.password"
        class="!w-full"
        type="password"
        show-password-on="mousedown"
        placeholder="输入密码(6-20字符)"
        @keyup.enter="handleLoginByPassword"
      />
    </n-form-item>
    <div class="flex justify-end -mt-4 mb-4">
      <span
        class="text-xs underline cursor-pointer text-gray-500 hover:text-gray-500/90"
        @click="handleForget"
      >
        忘记密码?
      </span>
    </div>

    <n-form-item>
      <n-button
        :loading="loginLoading"
        class="!w-full"
        attr-type="button"
        type="primary"
        size="large"
        @click="handleLoginByPassword"
      >
        登录
      </n-button>
    </n-form-item>
  </n-form>
</template>

<style></style>
