export class UrlService {
    static get root(): string {
        const config = useRuntimeConfig();
        return config.public.GAK_API_URL as string;
    }

    static get adminRoot(): string {
        return '/api/admin/'
    }

    static flightPlanToNavlog() {
        return UrlService.root + 'fp2nl'
    }

    static get isTestDB(): boolean {
        const config = useRuntimeConfig();
        return config.public.IS_TEST_DB as boolean;
    }

    static publications(): string {
        return UrlService.root + 'publications'
    }

    static publicationWithCode(code: string): string {
        return UrlService.root + 'publication/' + code
    }

    static template(id: any = undefined, ver: any = undefined): string {
        if (id) {
            let url = UrlService.root + 'template/' + id
            if (ver) {
                url += '/version/' + ver
            }
            return url
        }
        return UrlService.root + 'template'
    }

    static checklist(id: string | undefined = undefined): string {
        if (id) {
            return UrlService.root + 'checklist/' + id
        }
        return UrlService.root + 'checklist'
    }

    static templateExport(id: any, format: string): string {
        return UrlService.root + 'export/template/' + id + '/' + format.toLowerCase();
    }

    static templateThumbnail(): string {
        return UrlService.root + 'templateThumbnail'
    }
}
