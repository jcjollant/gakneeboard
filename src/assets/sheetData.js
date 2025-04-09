import { DemoData } from './DemoData'
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
}

import { duplicate } from './data'
import { FrequencyType } from '../model/Frequency'

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
const templateBlank = new Template('Blank','', false, [TemplatePage.SELECTION,TemplatePage.SELECTION])

const page0DemoNavlog = {
  type: PageType.navLog,
  data: {
    "from":"KRNT",
    "to":"KELN",
    "tt":52.68333333333334,
    "td":77.80000000000001,
    "entries":[
        {"name":"KRNT","alt":32,"th":144,"mh":129,"ld":4.2,"lt":3.5,"lf":2.4,"att":"+","gs":71,"fr":53},
        {"name":"TOC25","alt":2500,"th":143,"mh":128,"ld":2.9,"lt":1.65,"lf":0.2,"gs":106,"fr":50.6},
        {"name":"Lk Youngs Zebku","alt":2500,"th":90,"mh":75,"ld":4,"lt":3.5,"lf":0.7,"att":"+","gs":68,"fr":50.4},
        {"name":"TOC45","alt":4500,"th":90,"mh":75,"ld":1,"lt":0.6166666666666667,"lf":0.1,"gs":101,"fr":49.699999999999996},
        {"name":"Clear B Sh50","alt":4500,"th":90,"mh":75,"ld":2.2,"lt":2,"lf":0.4,"att":"+","gs":67,"fr":49.599999999999994},
        {"name":"TOC55","alt":5500,"th":90,"mh":75,"ld":4.5,"lt":2.8,"lf":0.4,"gs":96,"fr":49.199999999999996},
        {"name":"Clear B Sh60","alt":5500,"th":90,"mh":75,"ld":4.4,"lt":4,"lf":0.8,"att":"+","gs":66,"fr":48.8},
        {"name":"TOC75","alt":7500,"th":90,"mh":75,"ld":7.6,"lt":4.9,"lf":0.6,"gs":94,"fr":48},
        {"name":"Bandera 4W0","alt":7500,"th":90,"mh":75,"ld":28.8,"lt":18.25,"lf":2.4,"gs":95,"fr":47.4},
        {"name":"TOD","alt":7500,"th":81,"mh":66,"ld":18.2,"lt":11.466666666666667,"lf":1.5,"att":"-","gs":95,"fr":45},
        {"name":"KELN","alt":1763.2,"ld":0,"lt":0,"lf":0}
    ],
    ff:53,
    fr:13.5,
    ft:43.5,
    mv:-15,
    md:0,
    cta: 105,
    cff: 9,
    dr: 500,
    dff :6,
  }    
}

const page1DemoNavlog = {
  type: PageType.tiles,
  data:[
    {"id":0,"name":"airport","data":{"code":"krnt","rwy":"16-34"}},
    {"id":1,"name":"atis","data":{"mode":"compact"}},
    {"id":2,"name":"radios","data":[{"mhz":"122.9","name":"CTAF"},{"mhz":"135.275","name":"Stamp. Pass"},{"mhz":"117.9","name":"ELN VOR"},{"mhz":"123","name":"KELN CTAF"},{"mhz":"116.8","name":"SEA VORTAC"},{"mhz":"126.95","name":"KRNT ATIS"},{"mhz":"124.7","name":"KRNT TWR"}]},
    {"id":3,"name":"notes","data":{}},
    {"id":4,"name":"airport","data":{"code":"KELN","rwy":"11-29","rwyOrientation":"magnetic","corners":["weather","twr","field","tpa"]}},
    {"id":5,"name":"navlog","data":{}}
  ]
}

export const templateDemoNavlog = new Template('Navlog Demo', 'Navlog page along with six tiles', false, [page0DemoNavlog,page1DemoNavlog])

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

export function getTemplateDemoNavlog() {
  return duplicate(templateDemoNavlog)
}

// turn a default name into its data or null if the name is unkown
export function getTemplateDataFromName(name) {
  if( name == SheetName.default) {
    return DemoData.default()
  } else if( name == SheetName.tiles) {
    return DemoData.tiles()
  } else if( name == SheetName.checklist) {
    return DemoData.checklist()
  } else if( name == SheetName.navlog) {
    return getTemplateDemoNavlog()
  } else if( name == SheetName.new) { 
    return getTemplateBlank()
  } else if( name == SheetName.skyhawk) { 
    return DemoData.skyhawk()
  } else if( name == SheetName.charts) { 
    return DemoData.charts()
  } else if( name == SheetName.holds) { 
    return DemoData.holds()
  } else if( name == SheetName.ifrflight) { 
    return DemoData.ifrflight()
  } else {
    return null;
  }

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