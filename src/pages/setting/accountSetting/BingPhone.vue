<script setup lang="ts">
import { Save20Regular as SaveIcon } from "@vicons/fluent";
import { computed, reactive, ref } from "vue";
import type { FormInst, FormItemRule } from "naive-ui";

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
    required: true,
    min: 4,
    max: 4,
    message: "请输入 4 位验证码",
    trigger: ["input", "blur"],
  },
};
const userMobile = reactive({
  mobile: "",
  code: "",
});

const validateCode = ref<number>(60);
const timer = ref<number>();
const formRef = ref<FormInst | null>(null);

const getValidateCode = () => {
  if (userMobile.mobile) {
    timer.value = window.setInterval(() => {
      validateCode.value--;
    }, 1000);
  } else {
    formRef.value?.validate(
      () => {},
      (rule) => {
        return rule?.key === "mobile";
      }
    );
  }
};

const isShowCode = computed(() => validateCode.value !== 60);

const handleSave = (e: MouseEvent) => {
  formRef.value?.validate((errors) => {
    console.log("errors: ", errors);
    if (!errors) {
      console.log("save");
    } else {
      console.log("sa1ve");
    }
  });
};
</script>
<template>
  <n-card title="解绑手机" class="mb-5">
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
      :model="userMobile"
      label-placement="left"
      :label-width="80"
      :rules="rules"
    >
      <n-form-item label="新手机号" path="mobile">
        <n-input
          v-model:value="userMobile.mobile"
          :style="{ width: '350px' }"
          placeholder="请输入新手机号"
        />
      </n-form-item>

      <n-form-item label="验证码" path="code">
        <section class="flex" :style="{ width: '350px' }">
          <n-input
            v-model:value="userMobile.code"
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
