export class UserUsage {
    pages:number
    templates:number
    constructor() {
        this.pages = 0
        this.templates = 0
    }
    addTemplate(pages:number) {
        this.templates++
        this.pages += pages
    }
}