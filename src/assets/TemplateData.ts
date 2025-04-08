import axios from 'axios'
import { contentTypeJson, getUrlWithUser, currentUser, reportError } from './data.js'
import { isDefaultName } from './sheetData.js'
import { GApiUrl } from '../lib/GApiUrl.js'
import { PageType } from './PageType.js'
import { Template } from '../model/Template.js'

export class ExportOutput {
    filename:string;
    blob:Blob;
    constructor(blob:Blob, filename:string) {
        this.blob = blob
        this.filename = filename
    }
}

export class TemplateStatus {
    code:number;
    template:Template;
    constructor(code:number, template:Template) {
        this.code = code
        this.template = template
    }
}

export class TemplateData {
    /**
     * Delete custom sheet
     * @param {*} template 
     */
    static async delete(template:any) {
        const url = GApiUrl.template(template.id)
        if( !currentUser.loggedIn) {
            throw new Error('Cannot delete template without user')
        }
        return axios.delete(url,{params:{user:currentUser.sha256}})
            .then( response => {
                // console.log('[TemplateData.delete] template deleted', sheet.id)
                currentUser.removeTemplate(template.id)
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
                params:{user:currentUser.sha256}, 
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
    static async get(id:number):Promise<Template> {
        const url = GApiUrl.template(id)
        return new Promise( async (resolve, reject) => {
            getUrlWithUser(url).then( response => {
                // console.log('[data.sheetGetById]', JSON.stringify(response))
                const template = Template.parse(response.data)
                resolve( template);
            }).catch( error => {
                if(error.response && error.response.status == 404) {
                    resolve(new Template('', ''))
                } else {
                    console.log( error)
                    reject(error)
                }
            })
        })
        
    }

    /**
    * Save template to the backend. User must be logged in. Name must not conflict with defaults.
    * @param {*} template 
    * @returns Created template on success or null on failure
    */
    static async save(template:Template):Promise<TemplateStatus> {
        return new Promise( async (resolve, reject) => {
            const url = GApiUrl.template()
            if( !currentUser.loggedIn) {
                return reject('Cannot save template without user')
            }
            if( isDefaultName(template.name)) {
                return reject('Template name conflicts with defaults')
            }
            const payload = {user:currentUser.sha256, sheet:template}
            axios.post(url, payload, contentTypeJson)
                .then( response => {
                    // console.log('[TemplateData.save]', response.status)
                    // console.log('[Templates.save]', JSON.stringify(response))
                    const updatedTemplate = Template.parse(response.data)
                    currentUser.updateTemplate(updatedTemplate)
                    resolve( new TemplateStatus(response.status, updatedTemplate))
                })
                .catch( error => {
                    // is this a 402?
                    if(error.response && error.response.status == 402) {
                        reject('Maximum templates overshot. Consider upgrading or deleting templates')
                    } else {
                        reportError('[TemplateData.save] error ' + error)
                        reject(error)
                    }
                })
            })
    }

    static async updateThumbnail(id:number, imageBlob:Blob, sha256:string):Promise<string> {
        // console.log('[TemplateData.updateThumbnail] updating thumbnail', id, 'length', imageBlob.size)
        return new Promise( async (resolve, reject) => {
            const url = GApiUrl.templateThumbnail()
            if( !currentUser.loggedIn) {
                return reject('Cannot update thumbnail without user')
            }
            const formData = new FormData();
            formData.append('image', imageBlob, 'thumbnail.png')
            const sentId = GApiUrl.isTest() ? -id : id
            formData.append('templateId', sentId.toString())
            formData.append('user', currentUser.sha256)
            formData.append('sha256', sha256)

            axios.post(url, formData, { headers: {'Content-Type' : "multipart/form-data"}}).then( response => {
                const thumbnailUrl = response.data.url
                const thumbnailHash = response.data.hash
                // save the thumbnail for use by home page
                currentUser.updateThumbnail(id, thumbnailUrl, thumbnailHash)
                // console.log('[TemplateData.updateThumbnail] thumbnail updated', thumbnailUrl)
                resolve(thumbnailUrl)
            }).catch(err => reject(err))
        })
    }

}