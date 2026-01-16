export class GApiUrl {
    static root: string = 'https://api.kneeboard.ga/'
    // static root:string = 'https://ga-api-seven.vercel.app/'
    // static root: string = 'http://localhost:3000/'

    static flightPlanToNavlog() {
        return GApiUrl.root + 'fp2nl'
    }

    static isTest(): boolean {
        return GApiUrl.root.indexOf('localhost') > -1
    }

    static publications(): string {
        return GApiUrl.root + 'publications'
    }

    static publicationWithCode(code: string): string {
        return GApiUrl.root + 'publication/' + code
    }

    static template(id: any = undefined): string {
        if (id) {
            return GApiUrl.root + 'template/' + id
        }
        return GApiUrl.root + 'template'
    }

    static checklist(id: string | undefined = undefined): string {
        if (id) {
            return GApiUrl.root + 'checklist/' + id
        }
        return GApiUrl.root + 'checklist'
    }

    static templateExport(id: any, format: string): string {
        return GApiUrl.root + 'export/template/' + id + '/' + format.toLowerCase();
    }

    static templateThumbnail(): string {
        return GApiUrl.root + 'templateThumbnail'
    }
}