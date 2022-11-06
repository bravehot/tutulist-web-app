<script setup lang="ts">
import { computed, reactive, ref } from "vue";

import { getSmsCode, forgetPassword } from "@/service/user";

import type { FormInst, FormItemRule } from "naive-ui";

const emits = defineEmits<{
  (e: "back", value: boolean): void;
}>();
const forgetPasswordInfo = reactive({
  mobile: "",
  code: "",
  password: "",
});
const validateCode = ref<number>(60);
const timer = ref<number>();
const formRef = ref<FormInst | null>(null);
const loginLoading = ref(false);

const isShowPhoneCode = computed(() => validateCode.value !== 60);

const sendSmsCode = async () => {
  const { code } = await getSmsCode(forgetPasswordInfo.mobile);
  if (code === 200) {
    window.$message.success("短信验证码已发送");
  }
  return code === 200;
};

const getValidateCode = () => {
  if (forgetPasswordInfo.mobile) {
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
        if (!forgetPasswordInfo.mobile && rule?.key === "mobile") {
          return true;
        }
        return false;
      }
    );
  }
};

const handleResetPassword = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loginLoading.value = true;
      const { code } = await forgetPassword(forgetPasswordInfo);
      if (code == 200) {
        window.$message.success("重置成功");
        emits("back", false);
      }
      loginLoading.value = false;
    }
  });
};
const handleValidator = (_rule: FormItemRule, value: string) => {
  if (value) {
    const reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/;
    if (reg.test(value)) {
      return true;
    } else {
      return new Error("密码至少包含 数字和英文，长度6-20");
    }
  }

  return new Error("请输入新密码");
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
  password: {
    key: "password",
    min: 6,
    max: 20,
    required: true,
    validator: handleValidator,
    trigger: ["input", "blur"],
  },
};
</script>

<template>
  <n-form
    ref="formRef"
    class="mt-2"
    :model="forgetPasswordInfo"
    :rules="rules"
    :show-label="false"
  >
    <n-form-item path="mobile">
      <n-input
        v-model:value="forgetPasswordInfo.mobile"
        placeholder="输入手机号"
      />
    </n-form-item>
    <n-form-item path="code">
      <section class="flex" :style="{ width: '460px' }">
        <n-input
          v-model:value="forgetPasswordInfo.code"
          placeholder="短信验证码"
          maxlength="4"
          minlength="4"
          class="flex-1"
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
    <n-form-item path="password">
      <n-input
        v-model:value="forgetPasswordInfo.password"
        class="!w-full"
        type="password"
        show-password-on="mousedown"
        placeholder="新密码(6-20字符)"
        @keyup.enter="handleResetPassword"
      />
    </n-form-item>
    <n-form-item>
      <n-button
        :loading="loginLoading"
        class="!w-full"
        attr-type="button"
        type="primary"
        size="large"
        @click="handleResetPassword"
      >
        重置密码
      </n-button>
    </n-form-item>
  </n-form>
</template>
