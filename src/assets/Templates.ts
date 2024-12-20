export class Template {
    name:string
    desc:string
    publish:boolean
    data:any
    ver:number
    constructor(name:string, description:string, publish:boolean=false, data:any=[], version:number=0) {
        this.name = name
        this.desc = description
        this.publish = publish
        this.data = data
        this.ver = version
    }

    static describe(template:any):string {
        if(!template) return 'n/a'
        let output = template.desc??'(none)'
        if(template.publish) output += ' / Public [' + template.code + ']'
        if(template.ver > 0) output += ' v' + template.ver;
        return output
    }

    static getName(template:any):string {
        if(!template || !template.name) return '?'
        return template.name;
    }
}

export class TemplatePage {
    type:string
    data:any

    constructor(type:string, data:any) {
        this.type = type
        this.data = data
    }
}

