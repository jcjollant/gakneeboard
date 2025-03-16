import { PageType } from "../assets/PageType";

export class Template {
    id:number;
    name:string
    desc:string
    publish:boolean
    data:TemplatePage[]
    ver:number
    code:string
    constructor(name:string, description:string, publish:boolean=false, data:TemplatePage[]=[], version:number=0) {
        this.id = 0
        this.name = name
        this.desc = description
        this.publish = publish
        this.data = data
        this.ver = version
        this.code = ''
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

    public isInvalid():boolean {
        return this.name == '' && this.desc == '' && this.id == 0 && this.ver == 0
    }
    
    public isValid():boolean {
        return !this.isInvalid()
    }

    static noTemplate(): Template {
        const template = new Template('', '')
        const loadingPage =  new TemplatePage()
        template.data = [loadingPage,loadingPage]

        return template;
    }

    static parse(data:any):Template {
        const template = new Template(data.name, data.desc, data.publish, data.data, data.ver)
        template.id = data.id
        template.code = data.code
        return template
    }
}

export class TemplatePage {
    type:string
    name:string
    data:any

    static SELECTION = new TemplatePage(PageType.selection, '', {})

    constructor(type:string=PageType.loading, name:string='', data:any={}) {
        this.type = type
        this.name = name
        this.data = data
    }
}

