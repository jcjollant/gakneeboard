import axios from 'axios'
import { apiRootUrl, getUrlWithUser, setCurrentUserTemplates } from './data'

export class PageType {
  static selection = 'selection'
  static tiles = 'tiles'
  static checklist = 'checklist'
  static cover = 'cover'
  static navLog = 'navlog'
}


export class TemplateData {
    /**
    * Gets a publication from its public code
    * @param {*} code 
    * @returns 
    */
    static getPublication(code:string):any {
        const url = apiRootUrl + 'sheetByCode/' + code
        return axios.get( url)
            .then( response => response.data)
            .catch( error => {
                reportError( '[data.sheetGetByCode] error ' + JSON.stringify(error))
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

    static get(id:number):any {
        const url = apiRootUrl + 'sheet/' + id
        return getUrlWithUser(url).then( response => {
            // console.log('[data.sheetGetById]', JSON.stringify(response))
            const sheet = response.data;
            sheet.data = TemplateData.normalize(sheet.data)
            return sheet;
        }).catch( error => {
            if(error.response.status != 404) {
                reportError( '[data.sheetGetById] error ' + error.response.status + ' ' + error.response.statusText)
            }
            return null
        })
    }

    static getList() {
        const url = apiRootUrl + 'templates'
        return getUrlWithUser(url).then( response => {
            setCurrentUserTemplates(response.data)
            return response.data;
        })
        .catch( error => {
            reportError( '[data.sheetGetList] error ' + JSON.stringify(error))
            return null
        })
    }    
}