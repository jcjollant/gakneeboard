import { PageType} from './PageType'
import { Template, TemplatePage } from '../model/Template'
import { TileType } from '../model/TileType'
import { TileData } from '../model/TileData'

export class SheetName {
  static default = 'gak-default'
  static checklist = 'gak-checklist'
  static navlog = 'gak-navlog'
  static tiles = 'gak-tiles'
  static new = 'gak-new'
  static reset = 'gak-reset'
  static skyhawk = 'gak-skyhawk'
  static charts = 'gak-charts'
  static holds = 'gak-holds'
  static ifrflight = 'gak-ifrflight'
  static ifrstrips = 'gak-ifrstrips'
  static acronyms = 'gak-acronyms'
  static seattle = 'gak-seattle'
  static paperNavlog = 'gak-paper-navlog'
}

import { duplicate } from './data'
import { TemplateFormat } from '../model/TemplateFormat'

// used to check if a sheet name is already taken by defaults
const defaultNames = [SheetName.default, SheetName.tiles, SheetName.checklist, SheetName.reset]

// blank pages
const pageDataBlankTiles = {type:PageType.tiles,data:[
  {id:0,name:'',data:{}},
  {id:1,name:'',data:{}},
  {id:2,name:'',data:{}},
  {id:3,name:'',data:{}},
  {id:4,name:'',data:{}},
  {id:5,name:'',data:{}},
]}
const pageDataBlankChecklist = {type:PageType.checklist, data:{}}
// Template Blank has two blank pages
const templateBlank = new Template('Blank','', false, [TemplatePage.SELECTION,TemplatePage.SELECTION], TemplateFormat.Kneeboard)

export function describePage(sheet, pageNumber, maxLength=undefined) {
  if(!sheet) return "empty";

  let output = '?'
  if(!sheet.data || sheet.data.length < 2) return output
  const page = sheet.data[pageNumber]
  // do we have a page and a type yet?
  if(!page || !page.type) return output

  try {
    if(page.type == PageType.tiles) {
      output = "[Tiles] "
      // build the list of tiles
      const tiles = page.data.map( t => {
        if(t.name=='airport') {
          let tileName = "Airport";
          if(t.data.code) tileName += '(' + t.data.code.toUpperCase() + ')'
          return tileName
        } else if(t.name.length < 2) {
          return 'Selection'
        } else {
          // Just capitalize the tile name
          return t.name[0].toUpperCase() + t.name.substring(1)
        }
      })
      output += tiles.join(',');
    } else if(page.type == PageType.checklist) {
      output = "[Checklist] "
      if(page.data.name) output += page.data.name;
      // build a list of sections within that list
      if(page.data.items) {
        const sections = page.data.items.filter(i => 's' in i).map(i => i.s);
        if(sections.length) {
          output += " : " + sections.join(' / ')
        }
      }
    } else if(page.type == PageType.selection) {
      output = "[Selection]"
    } else if(page.type == PageType.cover ) {
      output =  "[Cover] " + page.data.title;
    } else if(page.type == PageType.navLog) {
      output = '[NavLog] '
      if(page.data.from && page.data.to) {
        output += page.data.from + " to " + page.data.to;
        if(page.data.entries) output += " (" + page.data.entries.length + " checkpoints)"
      } else if(page.data.continued) {
        output += 'continued'
      }
      
    } else if(page.type == PageType.approach) {
        output = '[Approach] ' + page.data.airport
    }
  } catch(e) {
    console.log('[sheetData.describePage] error', e)
  }

  // Truncate string if it's too long
  if(maxLength && output.length > maxLength) {
    output = output.substring(0, maxLength) + '...'
  }
  return output;
}

/**
 * Build a blank page for the given type
 * @param {*} type 
 * @returns 
 */
export function getPageBlank(type) {
  let source = TemplatePage.SELECTION
  if(type == PageType.checklist) {
    source = pageDataBlankChecklist;
  } else if(type == PageType.tiles) {
    source = pageDataBlankTiles
  }
  return duplicate(source)
}

/**
 * @returns a copy of blank sheet data
 */
export function getTemplateBlank() {
  return duplicate(templateBlank)
}  

export function getTemplateDummy() {
  const pages = []
  for( let pageIndex = 0; pageIndex < 2; pageIndex++) {
    const tiles = []
    for( let tileIndex = 0; tileIndex < 6; tileIndex++) {
      tiles.push({id:tileIndex,name:TileType.dummy,data:{header:pageIndex+'-'+tileIndex}})
    }
    const page = { type:PageType.tiles, data: tiles}
    pages.push(page)
  }
  return new Template('Dummy Tiles', '12 Dummy Tiles', false, pages)
}

export function isDefaultName(name) {
  return name in defaultNames
}

// See whether a page data string is valid
export async function readPageFromClipboard() {
  return new Promise( (resolve,reject) => {
    navigator.clipboard.readText().then( text => {
      try {
        const pageData = TemplatePage.parse(text)
        resolve( pageData)
      } catch(e) {
        reject('Clipboard data is not a Kneeboard Page')
      }
    }).catch( e => {
      reject('Clipboard access denied')
    })
  })
}

export async function readTileFromClipboard() {
  return new Promise( (resolve,reject) => {
    navigator.clipboard.readText().then( text => {
      try {
        const tileData = TileData.parse(text)
        resolve( tileData)
      } catch(e) {
        reject('Clipboard data is not a Kneeboard Tile')
      }
    }).catch( e => {
      reject('Clipboard access denied')
    })
  })
}
