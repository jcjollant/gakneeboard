/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly GAK_API_URL: string
    readonly GAK_USER_COUNT: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
