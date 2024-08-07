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

export const pageTypeSelection = 'selection'
export const pageTypeTiles = 'tiles'
export const pageTypeChecklist = 'checklist'

export const sheetNameDemoTiles = 'default-demo-tiles'
export const sheetNameDemoChecklist = 'default-demo-checklist'
export const sheetNameNew = 'default-new-sheet'
export const sheetNameReset = 'default-reset'
const activeSheetLocal = 'sheet'
export const sheetDataLocal = 'page1'

import { duplicate } from './data'

const allSheetNames = [sheetNameDemoTiles, sheetNameDemoChecklist, sheetNameReset, activeSheetLocal, sheetDataLocal]

// blank pages
const pageDataBlankTiles = {type:pageTypeTiles,data:[
  {id:0,name:'',data:{}},
  {id:1,name:'',data:{}},
  {id:2,name:'',data:{}},
  {id:3,name:'',data:{}},
  {id:4,name:'',data:{}},
  {id:5,name:'',data:{}},
]}
const pageDataBlankChecklist = {type:pageTypeChecklist, data:{}}
const pageDataBlankSelection = {type:pageTypeSelection,data:{}}

// Sheets
const sheetBlank = {
  name:'Blank',
  data:[pageDataBlankSelection,pageDataBlankSelection]
}

const sheetDemoTiles = {
  name: 'Tiles Demo',
  data: [{
    type:pageTypeTiles,
    name:"Tiles Demo",
    data:[
      {'id':0,'name':'airport','data':{'code':'krnt','rwy':'16-34'}},
      {'id':1,'name':'airport','data':{'code':'kbfi','rwy':'14L-32R'}},
      {'id':2,'name':'airport','data':{'code':'w39','rwy':'NE-SW','rwyOrientation':'magnetic'}},
      {'id':3,'name':'airport','data':{'code':'O26','rwy':'13-31'}},
      {'id':4,'name':'atis','data':{}},
      {'id':5,'name':'clearance','data':{}},
   ]},{
    type:pageTypeTiles,
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
  type:pageTypeChecklist,
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
        {c:'Walk Around',r:''},
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
  type:pageTypeChecklist,
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
    if(page.type == pageTypeTiles) {
      let output = "[Tiles] "
      const tiles = page.data.map( t => {
        if(t.name=='airport') {
          return "Airport(" + t.data.code.toUpperCase() + ")"
        } else  {
          return t.name[0].toUpperCase() + t.name.substring(1)
        }
      })
      return output + tiles.join(',');
    } else if(page.type == pageTypeChecklist) {
      let output = "[Checklist] " + page.data.name
      // build a list of sections within that list
      const sections = page.data.items.filter(i => 's' in i).map(i => i.s);
      if(sections.length) {
        return output + " : " + sections.join(' / ')
      }
      return output
    } else if(page.type == pageTypeSelection) {
      return "[Selection]"
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
  let source = pageDataBlankSelection
  if(type == pageTypeChecklist) {
    source = pageDataBlankChecklist;
  } else if(type == pageTypeTiles) {
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
export function getSheetDemoTiles() {
  return duplicate(sheetDemoTiles)
}  

export function getSheetDemoChecklist() {
  return duplicate(sheetDemoChecklist)
}  



export function isDefaultName(name) {
  return name in allSheetNames
}

export function localSheetLoad() {
  return JSON.parse(localStorage.getItem(activeSheetLocal))  
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
    const front = {type:pageTypeTiles,data:[data[0],data[1],data[2],data[3],data[4],data[5]]}
    // adjust ids to 6->0 ... 11->5
    for(let index = 6; index < 12; index++) {
      data[index].id -= 6;
    }
    const back = {type:pageTypeTiles,data:[data[6],data[7],data[8],data[9],data[10],data[11]]}
    data = [front, back]
  }

  return data;
}