<script setup lang="ts">
import { reactive, ref, watchEffect } from "vue";
import {
  Save20Regular as SaveIcon,
  Person20Regular as UserIcon,
} from "@vicons/fluent";
import COS from "cos-js-sdk-v5";
import { getCosConfig } from "@/service/upload";
import useGlobalStore from "@/stores/global";

import { updateUserInfo } from "@/service/user";

import { CosSTSType } from "@/types/upload";
import type { UploadCustomRequestOptions, UploadFileInfo } from "naive-ui";
import { UserGenderEnum } from "@/types/user";

const { VITE_COS_BUCKET } = import.meta.env;

const DIR = "web/avatar";

const fromRules = {
  username: {
    required: true,
    message: "请输入用户名",
    trigger: "blur",
  },
  mobile: {
    required: true,
    message: "请输入电话号码",
    trigger: ["input"],
  },
};

const GEDDER_OPTIONS = [
  {
    label: "男",
    value: 0,
  },
  {
    label: "女",
    value: 1,
  },
  {
    label: "保密",
    value: -1,
  },
] as const;

const userInfo = reactive({
  avatar: "",
  username: "",
  mobile: "",
  gender: UserGenderEnum.SECRECY,
});

const globalStore = useGlobalStore();

const cosConfigInfo = ref<CosSTSType>({
  credentials: {
    sessionToken: "",
    tmpSecretId: "",
    tmpSecretKey: "",
  },
  startTime: "",
  expiredTime: "",
});

watchEffect(() => {
  const currentInfo = globalStore.userInfo;
  if (currentInfo) {
    userInfo.avatar = currentInfo.avatar ?? "";
    userInfo.username = currentInfo.username;
    userInfo.mobile = currentInfo.mobile.toString();
    userInfo.gender = currentInfo.gender;
  }
});

const beforeUpload = async ({ file }: { file: UploadFileInfo }) => {
  const fileInfo = file.file;
  if (fileInfo) {
    const fileTypeList = ["image/jpg", "image/png", "image/jpeg"];
    const isLt2M = fileInfo.size / 1024 / 1024 < 2;

    if (!fileTypeList.includes(fileInfo.type)) {
      window.$message.warning("仅支持 png、jpg、jpeg");
      return false;
    }

    if (!isLt2M) {
      window.$message.warning("上传大小不能超过 2MB!");
      return false;
    }

    const { code, data } = await getCosConfig();
    if (code === 200) {
      cosConfigInfo.value = data;
      return true;
    }
  }
  return false;
};

const customRequest = async (info: UploadCustomRequestOptions) => {
  const { file, onFinish } = info;

  const cosConfig = {
    SecretId: cosConfigInfo.value.credentials.tmpSecretId,
    SecretKey: cosConfigInfo.value.credentials.tmpSecretKey,
    XCosSecurityToken: cosConfigInfo.value.credentials.sessionToken,
    StartTime: cosConfigInfo.value.startTime,
    ExpiredTime: cosConfigInfo.value.expiredTime,
  };
  const userId = globalStore.userInfo?.id;
  if (file.file && userId) {
    const cos = new COS(cosConfig);
    const Bucket = VITE_COS_BUCKET;
    const fileNames = file.name.split(".");
    const fileType = fileNames[fileNames.length - 1] || ".png";
    const res = await cos.putObject({
      Bucket,
      Region: "ap-beijing",
      Key: `${DIR}/${userId}/${userId}.${fileType}`,
      StorageClass: "STANDARD",
      Body: file.file, // 上传文件对象
    });

    if (res?.statusCode === 200) {
      window.$message.success("上传成功");
      userInfo.avatar = `https://${res.Location}`;
      onFinish();
    }
  }
};

const handleSave = async () => {
  const { code } = await updateUserInfo({
    username: userInfo.username,
    avatar: userInfo.avatar,
    gender: userInfo.gender,
  });
  if (code === 200) {
    window.$message.success("保存成功");
    globalStore.updateUserInfo(userInfo);
  }
};
</script>
<template>
  <n-card title="个人信息" class="mb-5">
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
      :label-width="80"
      label-placement="left"
      :model="userInfo"
      :rules="fromRules"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-gi :span="24" class="mb-10">
          <n-upload
            :on-before-upload="beforeUpload"
            class="flex justify-center"
            accept=".jpg,.png,.jpeg"
            :show-file-list="false"
            :custom-request="customRequest"
          >
            <n-avatar
              v-if="userInfo.avatar"
              class="cursor-pointer"
              round
              :size="70"
              :src="userInfo.avatar"
            />
            <n-avatar v-else round :size="70" class="cursor-pointer">
              <n-icon>
                <UserIcon />
              </n-icon>
            </n-avatar>
          </n-upload>
        </n-gi>

        <n-form-item-gi :span="12" label="用户名" path="username">
          <n-input
            v-model:value="userInfo.username"
            placeholder="请输入用户名"
          />
        </n-form-item-gi>

        <n-form-item-gi :span="12" label="手机号">
          <n-input v-model:value="userInfo.mobile" disabled />
        </n-form-item-gi>

        <n-form-item-gi label="性别" :span="12">
          <n-radio-group v-model:value="userInfo.gender" name="radiogroup">
            <n-space>
              <n-radio
                v-for="genderInfo in GEDDER_OPTIONS"
                :key="genderInfo.value"
                :value="genderInfo.value"
              >
                {{ genderInfo.label }}
              </n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </n-card>
</template>
