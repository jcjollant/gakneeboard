import { PageType } from "../assets/PageType";

export class Template {
    id:number
    name:string
    desc:string
    publish:boolean
    data:TemplatePage[]
    ver:number
    code:string
    thumbUrl:string|undefined
    thumbHash:string|undefined
    constructor(name:string, description:string, publish:boolean=false, data:TemplatePage[]=[], version:number=0) {
        this.id = 0
        this.name = name
        this.desc = description
        this.publish = publish
        this.data = data
        this.ver = version
        this.code = ''
        this.thumbUrl = undefined
        this.thumbHash = undefined
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
        // console.log('[Template.parse]', data)
        const template = new Template(data.name, data.desc, data.publish, data.data, data.ver)
        template.id = data.id
        template.code = data.code
        template.ver =  data?.ver ?? template.ver
        template.thumbUrl = data?.thumbUrl
        template.thumbHash = data?.thumbHash

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

    // Create a template page form its text description
    static parse(text:string):TemplatePage {
        const data = JSON.parse(text)
        // We want at least type and name
        if( !('type' in data && 'data' in data)) throw new Error('Invalid Page Format');
        if(!data) return this.SELECTION
        return new TemplatePage(data.type, data.name, data.data)
    }
}

