import axios from 'axios'
import { contentTypeJson, getUrlWithUser, newCurrentUser } from './data.js'
import { isDefaultName } from './sheetData.js'
import { GApiUrl } from '../lib/GApiUrl.js'


export class PageType {
  static selection = 'selection'
  static tiles = 'tiles'
  static checklist = 'checklist'
  static cover = 'cover'
  static navLog = 'navlog'
  static notes = 'notes'
  static approach = 'approach'
}

export class Template {
    name:string
    desc:string
    publish:boolean
    data:any
    constructor(name:string, description:string, publish:boolean=false, data:any=[]) {
        this.name = name
        this.desc = description
        this.publish = publish
        this.data = data
    }

    static describe(template:any):string {
        if(!template) return 'n/a'
        let output = template.desc??'(none)'
        if(template.publish) output += ' / Public [' + template.code + ']'
        return output
    }

    static getName(template:any):string {
        if(!template || !template.name) return '?'
        return template.name;
    }
}

export class TemplateSaveDialogMode {
    static save = 'save'
    static saveAs = 'saveAs'
    static overwrite = 'overwrite'
}

export class TemplatePage {
    type:string
    data:any

    constructor(type:string, data:any) {
        this.type = type
        this.data = data
    }
}

export class ExportOutput {
    filename:string;
    blob:Blob;
    constructor(blob:Blob, filename:string) {
        this.blob = blob
        this.filename = filename
    }
}

export class TemplateData {
    /**
     * Delete custom sheet
     * @param {*} template 
     */
    static async delete(template:any) {
        const url = GApiUrl.template(template.id)
        if( !newCurrentUser.loggedIn) {
            throw new Error('Cannot delete template without user')
        }
        return axios.delete(url,{params:{user:newCurrentUser.sha256}})
            .then( response => {
                // console.log('[TemplateData.delete] template deleted', sheet.id)
                newCurrentUser.removeTemplate(template.id)
                return template
            })
            .catch( error => {
                reportError('[TemplateData.delete] error ' + error)
                return null
            })
    }
    

    // export a template
    static async export(template:any, format:string):Promise<ExportOutput> {
        if(!template || !template.id) {
            throw new Error('Cannot export invalid template')
        }
        if(!format) {
            format = 'json'
        }
        const url = GApiUrl.templateExport(template.id, format)
        return new Promise((resolve, reject) => {
            axios({
                url:url,
                method:'get',
                params:{user:newCurrentUser.sha256}, 
                responseType:'arraybuffer',
                }).then( response => {
                    // console.log('[TemplateData.export] template exported', JSON.stringify(response.headers))
                    // extract file name from request headers 'attachment; filename="kneeboard.ace"'
                    const contentDisposition = response.headers['content-disposition']
                    const from = contentDisposition.indexOf('"') + 1
                    const to = contentDisposition.lastIndexOf('"')
                    const filename = contentDisposition.substring(from, to)

                    // console.log('[TemplateData.export] template exported', response.data)
                    const eo = new ExportOutput( new Blob([response.data]), filename)
                    resolve(eo)
                }).catch( error => {
                    reportError('[TemplateData.export] error ' + error)
                    reject(error)
                })
        })
    }

    /**
    * Gets a publication from its public code
    * @param {*} code 
    * @returns 
    */
    static getPublication(code:string):any {
        const url = GApiUrl.publicationWithCode(code)
        return axios.get( url)
            .then( response => response.data)
            .catch( error => {
                reportError( '[Templates.getPublication] error ' + JSON.stringify(error))
                return null
            })
    }

    /**
     * Get a list of publications
     * @returns 
     */
    static getPublications():any {
        const url = GApiUrl.publications()
        return getUrlWithUser( url)
            .then( response => response.data)
            .catch( error => {
                reportError( '[Templates.getPublications] error ' + JSON.stringify(error))
                return null
            })
    }

    /**
    * Gets a template from its id
    * @param {*} id
    * @returns
    */
    static getById(id:number):any {
        const url = GApiUrl.template(id)
        return axios.get( url)
            .then( response => {
                const template = response.data;
                template.data = TemplateData.normalize(template.data)
                return template;
            })
            .catch( error => {
                reportError( '[Templates.sheetGetById] error ' + JSON.stringify(error))
                return null
            })
    }

    /**
    * transform old format sheet (tiles without pages) into new format
    * @param {*} data 
    * @returns 
    */
    static normalize(data:any):any {
        if(!data) return data;
        if( typeof data == 'string') data = JSON.parse(data)

        // console.log('[sheetData.normalizeSheetData]', JSON.stringify(data))
        if(data.length == 12) { // old format with 12 tiles
            // transform into new format
            const front = {type:PageType.tiles,data:[data[0],data[1],data[2],data[3],data[4],data[5]]}
            // adjust ids to 6->0 ... 11->5
            for(let index = 6; index < 12; index++) {
                data[index].id -= 6;
            }
            const back = {type:PageType.tiles,data:[data[6],data[7],data[8],data[9],data[10],data[11]]}
            data = [front, back]
        }

        return data;
    }

    /**
     * Read template data from backend
     * @param id 
     * @returns 
     */
    static get(id:number):any {
        const url = GApiUrl.template(id)
        return getUrlWithUser(url).then( response => {
            // console.log('[data.sheetGetById]', JSON.stringify(response))
            const template = response.data;
            template.data = TemplateData.normalize(template.data)
            return template;
        }).catch( error => {
            if(error.response.status != 404) {
                reportError( '[Templates.get] error ' + error.response.status + ' ' + error.response.statusText)
            }
            return null
        })
    }

    /**
    * Save template to the backend. User must be logged in. Name must not conflict with defaults.
    * @param {*} template 
    * @returns Created template on success or null on failure
    */
    static save(template:any):any {
        const url = GApiUrl.template()
        if( !newCurrentUser.loggedIn) {
            throw new Error('Cannot save template without user')
        }
        if( isDefaultName(template.name)) {
            throw new Error('Template name conflicts with defaults')
        }
        const payload = {user:newCurrentUser.sha256, sheet:template}
        return axios.post(url, payload, contentTypeJson)
            .then( response => {
                // console.log('[Templates.save]', JSON.stringify(response))
                const updatedTemplate = response.data
                newCurrentUser.updateTemplate(updatedTemplate)
                return updatedTemplate
            })
            .catch( error => {
                reportError('[Templates.save] error ' + JSON.stringify(error))
                return null
            })
    }
}