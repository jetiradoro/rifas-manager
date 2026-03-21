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

interface Window {
  __RIFAS_RUNTIME_CONFIG__?: {
    VITE_API_BASE?: string;
    VITE_API_TOKEN?: string;
    VITE_APP_NAME?: string;
    VITE_APP_VERSION?: string;
    VITE_PACKAGE_NAME?: string;
    VITE_PACKAGE_VERSION?: string;
    VITE_CONTACT_EMAIL?: string;
    VITE_CONTACT_ADDRESS?: string;
    VITE_CONTACT_PHONE?: string;
    VITE_JWT_TOKEN?: string;
  };
}
