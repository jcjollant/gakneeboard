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
export const sheetNameLocal = 'page1'

const allSheetNames = [sheetNameDemoTiles, sheetNameDemoChecklist, sheetNameReset, sheetNameLocal]

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
const sheetDataBlank = [pageDataBlankSelection,pageDataBlankSelection]

export const sheetDataDemoTiles = [{
  type:pageTypeTiles,
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
    {'id':0,'name':'airport','data':{'code':'ktta','rwy':'03-21','pattern':2}},
    {'id':1,'name':'airport','data':{'code':'kawo','rwy':'all'}},
    {'id':2,'name':'sunlight','data':{'from':'KRNT','to':'KSFF'}},
    {'id':3,'name':'fuel'},
    {'id':4,'name':'notes','data':{}},
    {'id':5,'name':'radios','data':demoRadioData},
  ]
 }
]

const pageDemoChecklist1 = {
  type:pageTypeChecklist,
  data:{
    name:'Preflight',
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
export const sheetDataDemoChecklist = [pageDemoChecklist1,pageDemoChecklist2]

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
  return JSON.parse( JSON.stringify(source))
}


/**
 * @returns a copy of blank sheet data
 */
export function getSheetBlank() {
  return JSON.parse( JSON.stringify(sheetDataBlank))
}  

/**
 * @returns a copy of demo sheet data 
 */
export function getSheetDemoTiles() {
  return JSON.parse( JSON.stringify(sheetDataDemoTiles))
}  

export function getSheetDemoChecklist() {
  return JSON.parse( JSON.stringify(sheetDataDemoChecklist))
}  



export function isDefaultName(name) {
  return name in allSheetNames
}