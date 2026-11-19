/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_ADMIN_ID?: string;
  readonly VITE_ADMIN_PASSWORD?: string;
  readonly VITE_ADMIN_LOGIN_ID?: string;
  readonly VITE_ADMIN_AUTH_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
