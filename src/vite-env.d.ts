/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_COS_REGION: string;
  readonly VITE_COS_BUCKET: string;
  readonly VITE_API_DEV: string;
  readonly VITE_API_PROD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  $message: {
    success: (_message: string) => void;
    warning: (_message: string) => void;
    error: (_message: string) => void;
  };
}
