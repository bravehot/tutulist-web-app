<script setup lang="ts">
import { computed, reactive, ref, toRefs } from "vue";
import { Save20Regular as SaveIcon } from "@vicons/fluent";
import { useRouter } from "vue-router";

import useGlobalStore from "@/stores/global";
import { getSmsCode, updateUserPassword } from "@/service/user";

import type { FormInst, FormItemRule } from "naive-ui";

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

const rules = {
  oldPassword: {
    key: "oldPassword",
    min: 6,
    max: 20,
    required: true,
    validator: handleValidator,
    trigger: ["input", "blur"],
  },
  newPassword: {
    key: "newPassword",
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

const globalStore = useGlobalStore();
const router = useRouter();

const { userInfo } = toRefs(globalStore);
const userPassword = reactive({
  oldPassword: "",
  code: "",
  newPassword: "",
});
const validateCode = ref<number>(60);
const timer = ref<number>();
const formRef = ref<FormInst | null>(null);

const getValidateCode = async () => {
  if (
    userPassword.newPassword &&
    userPassword.oldPassword &&
    userInfo.value?.mobile
  ) {
    const { code } = await getSmsCode(String(userInfo.value.mobile));
    if (code === 200) {
      timer.value = window.setInterval(() => {
        validateCode.value--;
      }, 1000);
      window.$message.success("短信验证码已发送");
    }
  } else {
    formRef.value?.validate(
      () => {},
      (rule) => {
        return rule?.key ? rule?.key.endsWith("Password") : false;
      }
    );
  }
};

const isShowCode = computed(() => validateCode.value !== 60);

const handleSave = () => {
  formRef.value?.validate(async (error) => {
    if (!error && userInfo.value) {
      const { code: resCode } = await updateUserPassword({
        mobile: String(userInfo.value?.mobile),
        password: userPassword.oldPassword,
        newPassword: userPassword.newPassword,
        code: userPassword.code.toString(),
      });
      if (resCode === 200) {
        window.$message.success("密码修改成功，请重新登录");
        globalStore.handleLogout();
        router.push({
          name: "homePage",
        });
      }
    }
  });
};
</script>
<template>
  <n-card title="更改密码" class="mb-5">
    <template #header-extra>
      <n-button text type="primary" @click="handleSave">
        <template #icon>
          <n-icon>
            <SaveIcon />
          </n-icon>
        </template>
        保存
      </n-button>
    </template>
    <n-form
      ref="formRef"
      :model="userPassword"
      label-placement="left"
      :label-width="80"
      :rules="rules"
    >
      <n-form-item label="原密码" path="oldPassword">
        <n-input
          v-model:value="userPassword.oldPassword"
          show-password-on="mousedown"
          type="password"
          :style="{ width: '350px' }"
          placeholder="请输入原密码"
        />
      </n-form-item>

      <n-form-item label="新密码" path="newPassword">
        <n-input
          v-model:value="userPassword.newPassword"
          show-password-on="mousedown"
          type="password"
          :style="{ width: '350px' }"
          placeholder="请输入新密码"
        />
      </n-form-item>

      <n-form-item label="验证码" path="code">
        <section class="flex" :style="{ width: '350px' }">
          <n-input
            v-model:value="userPassword.code"
            placeholder="请输入验证码"
            maxlength="4"
            minlength="4"
            class="flex-1"
          />
          <n-button
            class="!ml-3"
            :disabled="isShowCode"
            @click="getValidateCode"
          >
            {{ isShowCode ? `${validateCode} 秒后重试` : "发送验证码" }}
          </n-button>
        </section>
      </n-form-item>
    </n-form>
  </n-card>
</template>
