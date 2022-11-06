import axios from "axios";
import router from "@/routes";

import useGlobalStore from "@/stores/global";
import { getRequestBaseURL } from "./index";

import { UserTokenEnum } from "@/types/user";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

const netWorkCodeMaps: Record<number, string> = {
  404: "404 Not Found",
  405: "Method Not Allowed",
  504: "网关错误",
  500: "服务器错误",
} as const;

const axiosInterface = axios.create({
  baseURL: getRequestBaseURL(),
  timeout: 10000,
  headers: {
    "content-type": "application/json",
  },
});

// 缓存 token 过期后的请求函数
let catchRequestFunc: Array<() => void> = [];

// 请求拦截
axiosInterface.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem(UserTokenEnum.ASSET_TOKEN);
  if (token) {
    const { headers } = config;
    headers!.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截
axiosInterface.interceptors.response.use(
  async (response: AxiosResponse<API.BaseResponseType<any>>) => {
    const { status, data } = response;
    if (status === 200) {
      const { code, message } = data;
      const responseCode = Number(code);

      // token 过期
      if (responseCode == 401) {
        // 缓存过期后的请求函数
        new Promise((resolve) => {
          catchRequestFunc.push(() => {
            resolve(request(response.config));
          });
        });
        // 通过 reference token 获取新 token
        await handleRefreshToken();
      } else if (responseCode === 403) {
        router.push({
          name: "homePage",
        });
      } else if (responseCode !== 200) {
        // 业务中非 200 的状态码一律弹出
        window.$message.error(message);
      }
    }
    return response;
  },
  ({ response }) => {
    // 请求失败，也弹出状态码
    window.$message.error(netWorkCodeMaps[response.status] || "服务器错误");
  }
);

const handleRefreshToken = async () => {
  const refreshToken = window.localStorage.getItem(UserTokenEnum.REFRESH_TOKEN);
  const globalStore = useGlobalStore();

  if (refreshToken) {
    const { code, data } = await request<{
      accessToken: string;
      refreshToken: string;
    }>({
      url: "/user/refreshToken",
      method: "post",
      data: {
        refreshToken: window.localStorage.getItem(UserTokenEnum.REFRESH_TOKEN),
      },
    });
    if (Number(code) === 200) {
      localStorage.setItem(UserTokenEnum.ASSET_TOKEN, data.accessToken);
      localStorage.setItem(UserTokenEnum.REFRESH_TOKEN, data.refreshToken);

      axiosInterface.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.accessToken}`;

      // 执行 token 失效后缓存的请求函数
      catchRequestFunc.forEach(async (catchFunc) => {
        await catchFunc();
      });
    } else {
      // refreshtoken 也过期了，那么跳登录页，重新登录
      globalStore.handleLogout();

      catchRequestFunc = [];
      router.push({
        name: "homePage",
      });
      window.$message.warning("请重新登录");
    }
  } else {
    // 不存在 refresh token, 跳登录页
    globalStore.handleLogout();
    catchRequestFunc = [];
    router.push({
      name: "homePage",
    });
    window.$message.warning("请重新登录");
  }
};

// 对外暴露 request 请求函数
const request = async <T>(
  config: AxiosRequestConfig
): Promise<API.BaseResponseType<T>> => {
  try {
    const { data } = await axiosInterface(config);
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export default request;
