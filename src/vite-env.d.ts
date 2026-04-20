/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_BROWSER_ROUTER?: string;
  readonly VITE_BASE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
