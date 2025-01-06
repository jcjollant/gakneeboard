export class UserUsage {
    pages:number
    templates:number
    constructor() {
        this.pages = 0
        this.templates = 0
    }
    addTemplate(data:any) {
        this.templates++
        this.pages += data.length
    }
}