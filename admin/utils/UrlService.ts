export class UrlService {
    static get root(): string {
        const config = useRuntimeConfig()
        return config.public.GAK_API_URL || "https://api.kneeboard.ga/"
    }

    static get adminRoot(): string {
        return '/api/admin/'
    }

    static get isTestDB(): boolean {
        const config = useRuntimeConfig()
        return (config.public.POSTGRES_URL || '').includes('ep-proud-field-a6tfe60l-pooler')
    }

    static get isProdDB(): boolean {
        const config = useRuntimeConfig()
        return (config.public.POSTGRES_URL || '').includes('ep-shrill-silence-a6ypne6y-pooler')
    }

    static get healthCheckUrl(): string {
        const root = this.root.endsWith('/') ? this.root.slice(0, -1) : this.root
        return `${root}/admin/healthCheck`
    }
}
