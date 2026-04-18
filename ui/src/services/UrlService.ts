export class UrlService {
    static root: string = import.meta.env.GAK_API_URL || 'https://api.kneeboard.ga/'

    static flightPlanToNavlog() {
        return UrlService.root + 'fp2nl'
    }

    static isTest(): boolean {
        return UrlService.root.indexOf('localhost') > -1
    }

    static isProd(): boolean {
        return UrlService.root.includes('api.kneeboard.ga')
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

    static usage(): string {
        return UrlService.root + 'usage'
    }

    static aircraft(id: number | string | undefined = undefined): string {
        if (id) {
            return UrlService.root + 'aircraft/' + id
        }
        return UrlService.root + 'aircraft'
    }

    static aircrafts(): string {
        return UrlService.root + 'aircrafts'
    }

    static aircraftTemplates(): string {
        return UrlService.root + 'aircraftTemplates'
    }
}
