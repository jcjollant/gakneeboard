const demoRadioData = [
  {'target':'NAV1','freq':'116.8','name':'SEA VOR'},
  {'target':'NAV2','freq':'113.4','name':'OLM VOR'},
  {'target':'COM1','freq':'124.7','name':'RNT TWR'},
  {'target':'COM2','freq':'126.95','name':'RNT ATIS'},
  {'target':'COM1','freq':'123.0','name':'S43 CTAF'},
  {'target':'COM2','freq':'128.65','name':'PAE ATIS'},
  {'target':'COM1','freq':'120.2','name':'PAE TWR 34R'},
  {'target':'COM1','freq':'132.95','name':'PAE TWR 34L'}
]

export class PageType {
  static selection = 'selection'
  static tiles = 'tiles'
  static checklist = 'checklist'
  static cover = 'cover'
  static navLog = 'navlog'
}


export const sheetNameDemo = 'default-demo'
export const sheetNameDemoTiles = 'default-demo-tiles'
export const sheetNameDemoChecklist = 'default-demo-checklist'
export const sheetNameNew = 'default-new-sheet'
export const sheetNameReset = 'default-reset'
const activeSheetLocal = 'sheet'
const oldSheetData = 'page1'

import { duplicate } from './data'

// used to check if a sheet name is already taken by defaults
const defaultSheetNames = [sheetNameDemo, sheetNameDemoTiles, sheetNameDemoChecklist, sheetNameReset, activeSheetLocal, oldSheetData]

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
export const pageDataBlank = {type:PageType.selection,data:{}}

// Sheets
const sheetBlank = {
  name:'Blank',
  data:[pageDataBlank,pageDataBlank]
}

const sheetDemo = {
  name: 'Default Demo',
  data: [{
    type:PageType.tiles,
    data:[
      {"id":0,"name":"airport","data":{"code":"KBFI","rwy":"14L-32R","rwyOrientation":"magnetic","corners":["weather","twr","field","tpa"]}},
      {"id":1,"name":"airport","data":{"code":"KSFF","rwy":"04L-22R","rwyOrientation":"vertical","corners":["weather","twr","field","tpa"],"pattern":2}},
      {"id":2,"name":"radios","data":[{"mhz":"116.8","name":"SEA VOR"},{"mhz":"124.7","name":"OLM VOR"},{"mhz":"124.7","name":"RNT TWR"},{"mhz":"126.95","name":"RNT ATIS"},{"mhz":"123","name":"S43 CTAF"},{"mhz":"128.65","name":"PAE ATIS"},{"mhz":"120.2","name":"PAE TWR 34R"},{"mhz":"132.95","name":"PAE TWR 34L"}]},
      {"id":3,"name":"notes","data":{}},
      {"id":4,"name":"atis","data":{}},
      {"id":5,"name":"clearance","data":{}}
    ]},{
      type:PageType.checklist,
      data:{
        "name":"Flight",
        "items":[
          {"s":"Climb","t":"strong"},{"c":"Power","r":"FULL"},{"c":"Mixture","r":"RICH"},{"c":"Flaps","r":"UP"},{"c":"Engine","r":"GREEN"},{"s":"Approach","t":"strong"},{"c":"Direct","r":"SET"},{"c":"ATIS","r":"GET"},{"c":"Altimeter","r":"SET"},{"c":"RWY HDG","r":"SET"},{"c":"Calls","r":"MADE"},{"c":"Briefing","r":"DONE"},{"s":"Engine FAILURE","t":"emer"},{"c":"Airspeed","r":"68"},{"c":"Fuel Pump","r":"ON"},{"c":"Mixture","r":"RICH"},{"c":"Fuel Shutoff","r":"ON"},{"c":"Fuel Selector","r":"BOTH"},{"s":"Engine FIRE","t":"emer"},{"c":"Mixture","r":"CUTOFF"},{"c":"Fuel Shutoff","r":"OFF"},{"c":"Fuel Pump","r":"OFF"},{"c":"Masters","r":"OFF"},{"c":"Vents, Heat, Air","r":"CLOSED"},{"c":"Emergency Descent","r":"120@30"},{"c":""}
        ],
        "items2":[
          {"s":"Cruise","t":"strong"},{"c":"Power","r":"SET"},{"c":"Flaps","r":"UP"},{"c":"Trim","r":"SET"},{"c":"Heading","r":"BUGGED"},{"s":"Before Landing","t":"strong"},{"c":"Fuel Selector","r":"BOTH"},{"c":"Mixture","r":"RICH"},{"c":"Landing Lights","r":"ON"},{"c":"Safety Belts","r":"ON"},{"c":"Auto Pilot","r":"OFF"},{"c":"Cabin Power","r":"OFF"},{"s":"After Landing"},{"c":"Flaps","r":"UP"},{"c":"Light","r":"TAXI"},{"c":"Mixture","r":"Lean"},{"c":"Trim","r":"T/O"},{"c":"Pitot","r":"OFF"},{"c":"Comms","r":"GND"},{"s":"Shutdown"},{"c":"Avionics","r":"OFF"},{"c":"Mixture","r":"IDLE"},{"c":"Magnetos","r":"OFF"},{"c":"Electrical Equipment","r":"OFF"},{"c":"Hobbs & Tach","r":"RECORD"},{"c":"Master & Stby","r":"OFF"}
        ],
        "theme":"blue"
      }
    }]
  }

const sheetDemoTiles = {
  name: 'Tiles Demo',
  data: [{
    type:PageType.tiles,
    name:"Tiles Demo",
    data:[
      {'id':0,'name':'airport','data':{'code':'krnt','rwy':'16-34'}},
      {'id':1,'name':'airport','data':{'code':'kbfi','rwy':'14L-32R'}},
      {'id':2,'name':'airport','data':{'code':'w39','rwy':'NE-SW','rwyOrientation':'magnetic'}},
      {'id':3,'name':'airport','data':{'code':'O26','rwy':'13-31'}},
      {'id':4,'name':'atis','data':{}},
      {'id':5,'name':'clearance','data':{}},
   ]},{
    type:PageType.tiles,
    data:[
      {'id':0,'name':'checklist','data':{name:'Power OFF stalls', items:[{"c":"Clearing Turns+Calls","r":"Made"},{"c":"Visual Reference","r":"Bugged"},{"c":"Altitude","r":"3,000"},{"c":"Power=1,600 Flaps > Full"},{"c":"Hold 65 3s, Level off until stall"},{"c":"Full Power + Right Rudder"},{"c":"Flaps 20 > 10 > 0"},{"c":"ACS HDG/Bank","r":"±10°/20°"}],theme:"blue"}},
      {'id':1,'name':'airport','data':{'code':'kawo','rwy':'all'}},
      {'id':2,'name':'sunlight','data':{'from':'KRNT','to':'KSFF'}},
      {'id':3,'name':'fuel'},
      {'id':4,'name':'notes','data':{}},
      {'id':5,'name':'radios','data':demoRadioData},
    ]
   }
  ]
}

const pageDemoChecklist1 = {
  type:PageType.checklist,
  data:{
    name:'Preflight',
    theme:'yellow',
    items: [
        {s:'Cabin'},
        {c:'Docs AR(R)OW',r:'CHECKED'},
        {c:'Control Wheel Lock + Pitot Cover',r:'REMOVED'},
        {c:'Kneeboard, Eyewear',r:'READY'},
        {c:'Headset, iPad',r:'INSTALLED'},
        {c:'Sentry, Camera, Power Bank',r:'INSTALLED'},
        {c:'Section 3',r:'READY'},
        {c:'Fire Extinguisher',r:'LATCHED'},
        {s:'Panel'},
        {c:'Ignition Switch',r:'OFF'},
        {c:'Avionics',r:'OFF'},
        {c:'Master Batt',r:'ON'},
        {c:'Lights + Pitot Heat',r:'ON'},
        {c:'Flaps',r:'FULL'},
        {s:'Walk Around'},
        {c:'All Lights',r:'CHECKED'},
        {c:'Antenas (Comm, ELT, Nav, GPS, OAT)',r:'CHECKED'},
        {c:'Wings (Frost, Ice)',r:'CLEAR'},
        {c:'Windshield',r:'CLEAN'},
        {c:'Pitot Tube',r:'HOT'},
        {s:'Panel'},
        {c:'Lights + Pitot Heat',r:'OFF'},
        {c:'Fuel Quantity',r:'CHECKED'},
        {c:'Hobbs & Tach',r:'RECORD'},
        {c:'Master Switches',r:'OFF'},
    ]
  }}
const pageDemoChecklist2 = {
  type:PageType.checklist,
  data : {
    name:'Preflight (Cont\'d)',
    theme:'yellow',
    items: [
        {s:'Tail'},
        {c:'Tie Down',r:'REMOVED'},
        {c:'Control Surface',r:'CHECKED'},
        {s:'Right Wing'},
        {c:'Tie Down',r:'REMOVED'},
        {c:'Control Surface',r:'CHECKED'},
        {c:'Main Tire, Wheel Pin, Brake Pad',r:'CHECKED'},
        {s:'Nose'},
        {c:'Engine Oil (8qt for long flight)',r:'> 6qt'},
        {c:'Prop & Spinner',r:'CHECKED'},
        {c:'Engine Air Inlets / Belt',r:'CHECKED'},
        {c:'Air Filter',r:'CHECKED'},
        {c:'Static Source',r:'CHECKED'},
        {c:'Front Tire / Shock',r:'CHECKED'},
        {s:'Left Wing'},
        {c:'Tie Down',r:'REMOVED'},
        {c:'Control Surface',r:'CHECKED'},
        {c:'Main Tire, Wheel Pin, Brake Pad',r:'CHECKED'},
        {c:'Fuel Vent',r:'CHECKED'},
        {c:'Stall Warning',r:'CHECKED'},
        {s:'Fuel Test'},
        {c:'Drain x13 + Smell',r:'TEST'},
        {c:'Dipstick measure x2',r:'BOTH'},
        {c:'Fuel Cap Seal x2',r:'CHECKED'},
        {c:'Fuel Cap Secured x2',r:'CHECKED'},
    ]
  }
}
export const sheetDemoChecklist = {
  name:'Checklist Demo',
  data:[pageDemoChecklist1,pageDemoChecklist2]
}

export function describePage(sheet, pageNumber) {
  if(!sheet) return "empty";
  if(!sheet.data || sheet.data.length < 2) return '?'
  const page = sheet.data[pageNumber]
  // do we have a page and a type yet?
  if(!page || !page.type) return '?'

  try {
    if(page.type == PageType.tiles) {
      let output = "[Tiles] "
      const tiles = page.data.map( t => {
        if(t.name=='airport') {
          return "Airport(" + t.data.code.toUpperCase() + ")"
        } else  {
          return t.name[0].toUpperCase() + t.name.substring(1)
        }
      })
      return output + tiles.join(',');
    } else if(page.type == PageType.checklist) {
      let output = "[Checklist] " + page.data.name
      // build a list of sections within that list
      const sections = page.data.items.filter(i => 's' in i).map(i => i.s);
      if(sections.length) {
        return output + " : " + sections.join(' / ')
      }
      return output
    } else if(page.type == PageType.selection) {
      return "[Selection]"
    } else if(page.type == PageType.cover ) {
      return "[Cover] " + page.data.title;
    } else if(page.type == PageType.navLog) {
      return '[NavLog]'
    }
  } catch(e) {
    console.log('[sheetData.describePage] error', e)
  }
  return "?"
}

/**
 * Build a blank page for the given type
 * @param {*} type 
 * @returns 
 */
export function getPageBlank(type) {
  let source = pageDataBlank
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
export function getSheetBlank() {
  return duplicate(sheetBlank)
}  

/**
 * @returns a copy of demo sheet data 
 */
export function getSheetDemo() {
  return duplicate(sheetDemo)
}  

/**
 * @returns a copy of demo sheet data 
 */
export function getSheetDemoTiles() {
  return duplicate(sheetDemoTiles)
}  

/**
 * @returns a copy of checklist demo sheet data 
 */
export function getSheetDemoChecklist() {
  return duplicate(sheetDemoChecklist)
}  

// Load active sheet from localstorage
export function getSheetLocal() {
  const localSheet = JSON.parse(localStorage.getItem(activeSheetLocal))  
  if(!localSheet) { 
    // try old page system
    let data = JSON.parse(localStorage.getItem(oldSheetData))
    // create a local sheet with no name
    localSheet = {data:data}
    // TODO remove data from localstorage
    // Save activeSheet locally
    localSheetSave(localSheet)
  }
  return localSheet
}

export function isDefaultName(name) {
  return name in defaultSheetNames
}

// Save sheet data to browser
export function localSheetSave(sheet,modified=false) {
  if(sheet) sheet.modified = modified;
  localStorage.setItem(activeSheetLocal, JSON.stringify( sheet))
}

/**
 * transform old format sheet (tiles without pages) into new format
 * @param {*} sheet 
 * @returns 
 */
export function normalizeSheetData(data) {
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

// See whether a page data string is valid
export async function readPageFromClipboard(page) {
  return new Promise( (resolve,reject) => {
    navigator.clipboard.readText().then( text => {
      try {
        const pageData = JSON.parse(text)
        if( !('type' in pageData && 'data' in pageData)) throw new Error('Unkonw object format');
        resolve( pageData)
      } catch(e) {
        reject('Clipboard data is not a Kneeboard Page')
      }
    }).catch( e => {
      reject('Clipboard access denied')
    })
  })
}