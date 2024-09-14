import { PageType } from './Templates'


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


export const sheetNameDemo = 'default-demo'
export const sheetNameDemoChecklist = 'default-demo-checklist'
export const sheetNameDemoNavlog = 'default-demo-navlog'
export const sheetNameDemoTiles = 'default-demo-tiles'
export const sheetNameNew = 'default-new-sheet'
export const sheetNameReset = 'default-reset'

import { duplicate } from './data'

// used to check if a sheet name is already taken by defaults
const defaultNames = [sheetNameDemo, sheetNameDemoTiles, sheetNameDemoChecklist, sheetNameReset]

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

const pageDemoNavlog0 = {
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

const pageDemoNavlog1 = {
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

export const sheetDemoNavlog = {
  name: 'Navlog Demo',
  data: [pageDemoNavlog0,pageDemoNavlog1]
}

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

export function getSheetDemoNavlog() {
  return duplicate(sheetDemoNavlog)
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

// turn a default name into its data or null if the name is unkown
export function getTemplateDataFromName(name) {
  if( name == sheetNameDemo) {
    return getSheetDemo()
  } else if( name == sheetNameDemoTiles) {
    return getSheetDemoTiles()
  } else if( name == sheetNameDemoChecklist) {
    return getSheetDemoChecklist()
  } else if( name == sheetNameDemoNavlog) {
    return getSheetDemoNavlog()
  } else if( name == sheetNameNew) { 
    return getSheetBlank()
  } else {
    return null;
  }

}

export function isDefaultName(name) {
  return name in defaultNames
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