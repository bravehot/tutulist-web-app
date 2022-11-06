<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import useGlobalStore from "@/stores/global";
import { getSmsCode, loginByCode } from "@/service/user";

import type { FormInst, FormItemRule } from "naive-ui";
import { UserTokenEnum } from "@/types/user";

const router = useRouter();
const globalStore = useGlobalStore();

const loginFormInfo = reactive({
  mobile: "",
  code: "",
});
const validateCode = ref<number>(60);
const timer = ref<number>();
const formRef = ref<FormInst | null>(null);
const loginLoading = ref(false);

const isShowPhoneCode = computed(() => validateCode.value !== 60);

const sendSmsCode = async () => {
  const { code } = await getSmsCode(loginFormInfo.mobile);
  if (code === 200) {
    window.$message.success("短信验证码已发送");
  }
  return code === 200;
};

const getValidateCode = () => {
  if (loginFormInfo.mobile) {
    sendSmsCode();
    timer.value = window.setInterval(() => {
      validateCode.value--;
      if (validateCode.value === 0) {
        validateCode.value = 60;
        clearInterval(timer.value);
      }
    }, 1000);
  } else {
    formRef.value?.validate(
      () => {},
      (rule) => {
        if (!loginFormInfo.mobile && rule?.key === "mobile") {
          return true;
        }
        return false;
      }
    );
  }
};

const handleLoginByPassword = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loginLoading.value = true;
      const { code, data } = await loginByCode(loginFormInfo);
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
  code: {
    min: 4,
    max: 4,
    required: true,
    message: "请输入验证码",
    trigger: ["input", "blur"],
  },
};
</script>

<template>
  <n-form
    ref="formRef"
    class="mt-2"
    :model="loginFormInfo"
    :rules="rules"
    :show-label="false"
  >
    <n-form-item path="mobile">
      <n-input v-model:value="loginFormInfo.mobile" placeholder="输入手机号" />
    </n-form-item>
    <n-form-item path="code">
      <section class="flex" :style="{ width: '460px' }">
        <n-input
          v-model:value="loginFormInfo.code"
          placeholder="短信验证码"
          maxlength="4"
          minlength="4"
          class="flex-1"
          @keyup.enter="handleLoginByPassword"
        />
        <n-button
          class="!ml-3"
          :disabled="isShowPhoneCode"
          @click="getValidateCode"
        >
          {{ isShowPhoneCode ? `${validateCode} 秒后重试` : "发送验证码" }}
        </n-button>
      </section>
    </n-form-item>
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
