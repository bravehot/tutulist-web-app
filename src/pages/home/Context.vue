<script setup lang="ts">
import { computed } from "vue";
import { LogoGithub } from "@vicons/ionicons4";
import { YuqueFilled as YuqueIcon } from "@vicons/antd";
import { CheckboxPerson20Regular as PersonIcon } from "@vicons/fluent";

import darkCalendarImg from "@/assets/dark_calendar.png";
import lightCalendarImg from "@/assets/light_calendar.png";
import darkQuadrant from "@/assets/dark_quadrant.png";
import lightQuadrant from "@/assets/light_quadrant.png";
import darkTodoBox from "@/assets/dark_todoBox.png";
import lightTodoBox from "@/assets/light_todoBox.png";
import wechatQrCode from "@/assets/wechat_qrcode.jpeg";
import yuqueQrCode from "@/assets/yuque_qrcode.png";

import useGlobalStore from "@/stores/global";

import { LoginTabsType } from "@/types/user";

const YUQUE_LINK = "https://www.yuque.com/aiyouwai/tutulist";

const emits = defineEmits<{
  (e: "open-model", value: LoginTabsType): void;
}>();
const globalStore = useGlobalStore();

const isDark = computed(() => globalStore.theme);
const isLogin = computed(() => globalStore.userInfo?.id);

const handleCreateAccount = () => {
  if (isLogin.value) {
    window.open(YUQUE_LINK);
  } else {
    emits("open-model", "register");
  }
};
const handleCode = () => {
  window.open("https://github.com");
};
</script>
<template>
  <section class="wrapper bg-gre">
    <section class="first-screen flex">
      <section class="left-info flex items-center -mt-30 w-2/3">
        <img v-if="isDark" :src="darkCalendarImg" />
        <img v-else :src="lightCalendarImg" />
      </section>
      <section
        class="right-info w-1/3 flex items-center justify-center flex-col"
      >
        <div>
          <h2 class="title text-7xl">Tutu List</h2>
          <div class="sub-title mt-6 text-center">一款时间日程管理应用</div>
          <div class="flex mt-20 flex-start w-full justify-center">
            <n-button
              type="primary"
              secondary
              class="!mr-6"
              size="large"
              @click="handleCreateAccount"
            >
              <template #icon>
                <n-icon v-if="isLogin">
                  <YuqueIcon />
                </n-icon>
                <n-icon v-else> <PersonIcon /></n-icon>
              </template>
              {{ isLogin ? "知识库文档" : "创建账户" }}
            </n-button>
            <n-button secondary size="large" @click="handleCode">
              <template #icon>
                <n-icon> <LogoGithub /></n-icon>
              </template>
              获取源代码
            </n-button>
          </div>
        </div>
      </section>
    </section>
    <section class="flex items-center pb-20">
      <section class="w-2/5 -mt-20">
        <h3 class="other-title text-5xl font-normal">时间四象限</h3>
        <div class="sub-title mt-6">告别瞎忙,利用四象限法则,进行事项划分</div>
      </section>

      <section class="right-info w-3/5">
        <img v-if="isDark" :src="darkQuadrant" />
        <img v-else :src="lightQuadrant" />
      </section>
    </section>

    <section class="flex items-center pb-20">
      <section class="w-3/5">
        <img v-if="isDark" :src="darkTodoBox" />
        <img v-else :src="lightTodoBox" />
      </section>
      <section class="w-2/5 -mt-20" style="margin-left: 6%">
        <h3 class="other-title text-5xl font-normal">任务箱</h3>
        <div class="sub-title mt-6">存放那些非常想做但又不知何时去做的事情</div>
      </section>
    </section>

    <section>
      <h3 class="other-title text-2xl font-bold text-center tracking-widest">
        关 于
      </h3>
      <section
        class="text-sm leading-7 mt-5 text-gray-400 dark:text-zine-400 tracking-wide"
      >
        <p>
          <span class="tu"> tutulist </span>
          是由<span class="tu"> tu </span>
          头 末流前端 程序员
          的个人项目，目前前后端代码已开源，在食用过程中如果有任何问题，欢迎在
          GitHub 上提交 issue。
        </p>
        <p>
          <span class="tu">tu</span>
          头目前是一名四年工作经验的前端工程师，编写该项目的初衷还是以技术学习为主。该项目从开发到部署的相关技术类问题均记录在
          <a target="_blank" :href="YUQUE_LINK" class="hover:text-gray-400/80">
            语雀知识库
          </a>
          中，对技术实现感兴趣的小伙伴可结合代码自行查阅食用；
        </p>
        <p>
          <span class="tu">tutulist</span> 会持续更新, 使用 uni-app
          构建的微信小程序也即将上线, 并且后面也会陆续开发Electron
          桌面端、Flutter 客户端。为了防止迷路，欢迎大家关注
          <span class="tu">tutulist</span> 微信公众号;
        </p>

        <section class="qrcode grid w-60 grid-cols-2 gap-8 mx-auto mt-10">
          <img :src="wechatQrCode" />
          <img :src="yuqueQrCode" />
        </section>
      </section>
    </section>

    <section class="h-full text-center mt-20 mb-5">
      <n-button text tag="a" href="https://beian.miit.gov.cn/" target="_blank">
        京ICP备2022005041号-1
      </n-button>
    </section>
  </section>
</template>
<style scoped lang="scss">
.wrapper {
  width: 1280px;
  margin: 0 auto;
  .first-screen {
    height: calc(100vh - 64px);
  }
  .title {
    font-family: "Fredoka One";
    text-shadow: 5px 5px rgb(0 0 0 / 10%);
    @apply text-stone-700/70 tracking-widest dark:text-stone-300;
  }
  .other-title {
    font-family: "Fredoka One";
    @apply text-stone-700/70 tracking-wider dark:text-stone-200;
  }
  .sub-title {
    @apply text-slate-500 text-lg tracking-widest dark:text-stone-400;
  }
  .tu {
    font-family: "SupermercadoOne-Regular";
  }

  .qrcode {
    img {
      width: 100px;
      height: 100px;
    }
  }
}
</style>
