declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
    VITE_APP_NAME?: string;
    VITE_APP_VERSION?: string;
    VITE_API_BASE?: string;
    VITE_API_TOKEN?: string;
    VITE_PACKAGE_NAME?: string;
    VITE_PACKAGE_VERSION?: string;
  }
}
