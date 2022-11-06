<script setup lang="ts">
import { computed, reactive, ref } from "vue";

import { registerUser, getSmsCode } from "@/service/user";
import type { FormInst, FormItemRule } from "naive-ui";
import type { LoginTabsType } from "@/types/user";

const emits = defineEmits<{
  (e: "set-tabs", value: LoginTabsType): void;
}>();

const registerFormInfo = reactive({
  mobile: "",
  password: "",
  code: "",
});
const validateCode = ref<number>(60);
const timer = ref<number>();
const loginLoading = ref(false);

const formRef = ref<FormInst | null>(null);

const isShowPhoneCode = computed(() => validateCode.value !== 60);

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

const sendSmsCode = async () => {
  const { code } = await getSmsCode(registerFormInfo.mobile);
  if (code === 200) {
    window.$message.success("短信验证码已发送");
  }
  return code === 200;
};
const getValidateCode = () => {
  if (registerFormInfo.mobile) {
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
        if (!registerFormInfo.mobile && rule?.key === "mobile") {
          return true;
        }
        return false;
      }
    );
  }
};

const handleRegister = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loginLoading.value = true;
      const { code } = await registerUser(registerFormInfo);
      if (code == 200) {
        window.$message.success("注册成功");
        emits("set-tabs", "login");
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
    :model="registerFormInfo"
    :rules="rules"
    :show-label="false"
  >
    <n-form-item path="mobile">
      <n-input
        v-model:value="registerFormInfo.mobile"
        placeholder="输入手机号"
      />
    </n-form-item>

    <n-form-item path="password">
      <n-input
        v-model:value="registerFormInfo.password"
        type="password"
        show-password-on="mousedown"
        placeholder="输入密码(6-20字符)"
      />
    </n-form-item>
    <n-form-item path="phone">
      <section class="flex" :style="{ width: '460px' }">
        <n-input
          v-model:value="registerFormInfo.code"
          placeholder="短信验证码"
          maxlength="4"
          minlength="4"
          class="flex-1"
          @keyup.enter="handleRegister"
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
        @click="handleRegister"
      >
        注册
      </n-button>
    </n-form-item>
  </n-form>
</template>
