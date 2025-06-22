import { PageType } from "../assets/PageType";
import { TemplateFormat } from "./TemplateFormat";

export class Template {
    id:number
    name:string
    desc:string
    publish:boolean
    data:TemplatePage[]
    pages:number;
    ver:number
    code:string
    thumbUrl:string|undefined
    thumbHash:string|undefined
    format:TemplateFormat
    constructor(name:string, description:string, publish:boolean=false, data:TemplatePage[]=[], format:TemplateFormat=TemplateFormat.Kneeboard, version:number=0) {
        this.id = 0
        this.name = name
        this.desc = description
        this.publish = publish
        this.data = data
        this.pages = data.length
        this.format = format
        this.ver = version
        this.code = ''
        this.thumbUrl = undefined
        this.thumbHash = undefined
        
        // console.log('[Template.constructor] Created template with format:', this.format);
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

    static noTemplate(pageCount:number = 2, format:TemplateFormat = TemplateFormat.Kneeboard): Template {
        const loadingPage = new TemplatePage()
        const data = Array<TemplatePage>(pageCount).fill(loadingPage)
        const template = new Template('', '', false, data, format)
        
        // console.log('[Template.noTemplate] Created template with format:', template.format, 'and', pageCount, 'pages');
        return template;
    }

    static parse(data:any):Template {
        // console.log('[Template.parse] Input data format:', data.format);
        // Ensure format is explicitly set and preserved
        const format = data.format || TemplateFormat.Kneeboard
        // console.log('[Template.parse] Using format:', format);
        const template = new Template(data.name, data.desc, data.publish, data.data, format, data.ver)
        template.id = data.id
        template.code = data.code
        template.ver =  data?.ver ?? template.ver
        template.thumbUrl = data?.thumbUrl
        template.thumbHash = data?.thumbHash
        template.pages = data.data.length || data.pages
        
        // Double-check that format is set correctly
        if (!template.format) {
            template.format = format;
            // console.log('[Template.parse] Format was missing, set to:', template.format);
        }
        
        // console.log('[Template.parse] Final template format:', template.format);
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
