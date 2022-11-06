import { h } from "vue";
import { NIcon } from "naive-ui";

import type { Component } from "vue";

const renderIcon = (icon: Component) => {
  return () => h(NIcon, null, { default: () => h(icon) });
};

const getPositionInfo = (
  dom: HTMLElement
): { left: number; top: number; height: number; width: number } => {
  const position = dom.getBoundingClientRect();
  return {
    left: Math.round(position.left),
    top: Math.round(position.top),
    height: Math.round(position.height),
    width: Math.round(position.width),
  };
};

const getRequestBaseURL = () => {
  const { MODE, VITE_API_DEV, VITE_API_PROD } = import.meta.env;
  const defaultBaseUrl = "/api";
  switch (MODE) {
    case "development":
      return defaultBaseUrl;
    case "staging":
      return VITE_API_DEV;
    case "production":
      return VITE_API_PROD;
    default:
      return defaultBaseUrl;
  }
};

export { renderIcon, getPositionInfo, getRequestBaseURL };
