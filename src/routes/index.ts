import { createRouter, createWebHashHistory } from "vue-router";

import type { RouteRecordRaw } from "vue-router";
import { UserTokenEnum } from "@/types/user";

// 首页
const Home = () => import("@/pages/home/index.vue");

// 日历页面
const Calendar = () => import("@/pages/calendar/index.vue");
const CalendarHome = () => import("@/pages/calendar/home/index.vue");
const Quadrant = () => import("@/pages/calendar/quadrant/index.vue");
const TodoBox = () => import("@/pages/calendar/todoBox/index.vue");

// 设置
const Setting = () => import("@/pages/setting/index.vue");
const AccountSetting = () => import("@/pages/setting/accountSetting/index.vue");
const PreferenceSetting = () =>
  import("@/pages/setting/preferenceSetting/index.vue");

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "homePage",
    component: Home,
    meta: {
      title: "首页",
    },
  },
  {
    path: "/calendar",
    name: "calendar",
    component: Calendar,
    redirect: "/calendar/home",
    children: [
      {
        path: "home",
        name: "home",
        component: CalendarHome,
        meta: {
          title: "日历视角",
        },
      },
      {
        path: "quadrant",
        name: "quadrant",
        component: Quadrant,
        meta: {
          title: "时间四象限",
        },
      },
      {
        path: "todoBox",
        name: "todoBox",
        component: TodoBox,
        meta: {
          title: "任务箱",
        },
      },
    ],
  },
  {
    path: "/setting",
    name: "setting",
    redirect: "/setting/account",
    component: Setting,
    meta: {
      title: "设置",
    },
    children: [
      {
        path: "account",
        name: "accountSetting",
        component: AccountSetting,
        meta: {
          title: "账户设置",
        },
      },
      {
        path: "preference",
        name: "preferenceSetting",
        component: PreferenceSetting,
        meta: {
          title: "偏好设置",
        },
      },
    ],
  },
  // 不识别的路由自动跳 home 页
  {
    path: "/:catchAll(.*)",
    redirect: "/home",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 全局导航守卫
router.beforeEach((to, _from, next) => {
  const base_title = " - tutuList";

  const token = localStorage.getItem(UserTokenEnum.ASSET_TOKEN);
  const refreshToken = localStorage.getItem(UserTokenEnum.REFRESH_TOKEN);
  if (to.meta.title) {
    document.title = `${to.meta.title}${base_title}`;
  }
  if (to.name !== "homePage" && (!token || !refreshToken)) {
    next({ name: "homePage" });
    window.$message.warning("您还未登录");
  } else {
    next();
  }
});

export default router;
