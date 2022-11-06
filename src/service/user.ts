import request from "@/utils/request";

import type {
  LoginByCode,
  LoginByPassword,
  Register,
  UpdateUserPassword,
  UserGenderEnum,
  UserInfo,
} from "@/types/user";

export const loginByPassword = async (loginInfo: LoginByPassword) => {
  return await request<{
    accessToken: string;
    refreshToken: string;
  }>({
    url: "/user/loginByPassword",
    method: "post",
    data: loginInfo,
  });
};

export const loginByCode = async (loginInfo: LoginByCode) => {
  return await request<{
    accessToken: string;
    refreshToken: string;
  }>({
    url: "/user/loginByCode",
    method: "post",
    data: loginInfo,
  });
};

export const registerUser = async (reqisterInfo: Register) => {
  return await request({
    url: "/user/register",
    method: "post",
    data: reqisterInfo,
  });
};

export const getUserInfo = async () => {
  return await request<UserInfo>({
    url: "/user/info",
    method: "get",
  });
};

export const getSmsCode = async (mobile: string) => {
  return await request({
    url: "/user/sendCode",
    method: "get",
    params: {
      mobile,
    },
  });
};

export const updateUserPassword = async (passwordInfo: UpdateUserPassword) => {
  return await request({
    url: "/user/updatePassword",
    method: "put",
    data: passwordInfo,
  });
};

export const changeBindPhone = async (mobileInfo: LoginByCode) => {
  return await request({
    url: "/user/changeMobile",
    method: "put",
    data: mobileInfo,
  });
};

export const forgetPassword = async (userInfo: Register) => {
  return await request({
    url: "/user/forgetPassword",
    method: "post",
    data: userInfo,
  });
};

export const updateUserInfo = async (data: {
  username: string;
  avatar: string;
  gender: UserGenderEnum;
}) => {
  return await request({
    url: "/user/update",
    method: "put",
    data,
  });
};

export const userCancellation = async () => {
  return await request({
    url: "/user/cancellation",
    method: "get",
  });
};
