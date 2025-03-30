import { FrequencyType } from "../model/Frequency"
import { Template, TemplatePage } from "../model/Template"
import { TileType } from "../model/TileType"
import { PageType } from "./PageType"

export class DemoData {

    static demoRadioData = [
        {mhz:116.8,name:'SEA VOR',type:FrequencyType.navaid},
        {mhz:113.4,name:'OLM VOR',type:FrequencyType.navaid},
        {mhz:124.7,name:'KRNT CTAF', type:FrequencyType.ctaf},
        {mhz:126.95,name:'KRNT ATIS',type:FrequencyType.weather},
        {mhz:123.0,name:'S43 CTAF',type:FrequencyType.ctaf},
        {mhz:128.65,name:'KPAE',type:FrequencyType.weather},
        {mhz:120.2,name:'PAE TWR 34R', type:FrequencyType.tower},
        {mhz:132.95,'name':'PAE TWR 34L', type:FrequencyType.tower}
    ]

    static page0DemoHold = new TemplatePage(PageType.tiles, "Holds Demo",
        [
            {id:0, name:TileType.clearance, data: { mode: "hold"}},
            {id:1, name:TileType.notes, data: { mode: "compass", comp: false}},
            {id:2, name:TileType.clearance, data: { mode: "hold"}},
            {id:3, name:TileType.notes, data: { mode: "compass", comp: false}},
            {id:4, name:TileType.clearance, data: { mode: "hold"}},
            {id:5, name:TileType.notes, data: { mode: "compass", comp: false}},
        ]
    )

    static page0DemoTiles = new TemplatePage( PageType.tiles, "Tiles Demo",
        [
            {name:TileType.airport,'data':{'code':'krnt','rwy':'16-34'}},
            {name:TileType.airport,'data':{'code':'kbfi','rwy':'14L-32R'}},
            {name:TileType.airport,'data':{'code':'w39','rwy':'NE-SW','rwyOrientation':'magnetic'}},
            {name:TileType.airport,'data':{'code':'O26','rwy':'13-31'}},
            {name:TileType.atis,'data':{}},
            {name:TileType.clearance,"data":{mode:'dep',airport:'kbfi'}}
        ]
    ) 

    static page1DemoTiles = new TemplatePage( PageType.tiles, "Tiles",
        [
            {name:TileType.checklist,'data':{name:'Power OFF stalls', items:[{"c":"Clearing Turns+Calls","r":"Made"},{"c":"Visual Reference","r":"Bugged"},{"c":"Altitude","r":"3,000"},{"c":"Power=1,600 Flaps > Full"},{"c":"Hold 65 3s, Level off until stall"},{"c":"Full Power + Right Rudder"},{"c":"Flaps 20 > 10 > 0"},{"c":"ACS HDG/Bank","r":"±10°/20°"}],theme:"blue"}},
            {name:TileType.airport,'data':{'code':'kawo',mode:'list'}},
            {name:TileType.sunlight,'data':{'from':'KRNT','to':'KSFF'}},
            {name:TileType.fuel},
            {name:TileType.notes,'data':{}},
            {name:TileType.radios,'data':DemoData.demoRadioData},
        ]
    )

    static page0DemoDefault = new TemplatePage( PageType.tiles, 'Default',
        [
            {name:"airport","data":{"code":"KBFI","rwy":"14L-32R","rwyOrientation":"magnetic","corners":["weather","twr","field","tpa"]}},
            {name:"airport","data":{"code":"KSFF","rwy":"04L-22R","rwyOrientation":"vertical","corners":["weather","twr","field","tpa"],"pattern":2}},
            {name:"radios","data":DemoData.demoRadioData},
            {name:"notes","data":{}},
            {name:"atis","data":{}},
            {name:"clearance","data":{mode:'dep',airport:'kbfi'}}
        ]
    )

    static page1DemoDefault = new TemplatePage( PageType.checklist, 'Default', 
        {
            "name":"Flight",
            "items":[{"s":"Climb","t":"strong"},{"c":"Power","r":"FULL"},{"c":"Mixture","r":"RICH"},{"c":"Flaps","r":"UP"},{"c":"Engine","r":"GREEN"},{"s":"Approach","t":"strong"},{"c":"Direct","r":"SET"},{"c":"ATIS","r":"GET"},{"c":"Altimeter","r":"SET"},{"c":"RWY HDG","r":"SET"},{"c":"Calls","r":"MADE"},{"c":"Briefing","r":"DONE"},{"s":"Engine FAILURE","t":"emer"},{"c":"Airspeed","r":"68"},{"c":"Fuel Pump","r":"ON"},{"c":"Mixture","r":"RICH"},{"c":"Fuel Shutoff","r":"ON"},{"c":"Fuel Selector","r":"BOTH"},{"s":"Engine FIRE","t":"emer"},{"c":"Mixture","r":"CUTOFF"},{"c":"Fuel Shutoff","r":"OFF"},{"c":"Fuel Pump","r":"OFF"},{"c":"Masters","r":"OFF"},{"c":"Vents, Heat, Air","r":"CLOSED"},{"c":"Emergency Descent","r":"120@30"},{"c":""}],
            "items2":[{"s":"Cruise","t":"strong"},{"c":"Power","r":"SET"},{"c":"Flaps","r":"UP"},{"c":"Trim","r":"SET"},{"c":"Heading","r":"BUGGED"},{"s":"Before Landing","t":"strong"},{"c":"Fuel Selector","r":"BOTH"},{"c":"Mixture","r":"RICH"},{"c":"Landing Lights","r":"ON"},{"c":"Safety Belts","r":"ON"},{"c":"Auto Pilot","r":"OFF"},{"c":"Cabin Power","r":"OFF"},{"s":"After Landing"},{"c":"Flaps","r":"UP"},{"c":"Light","r":"TAXI"},{"c":"Mixture","r":"Lean"},{"c":"Trim","r":"T/O"},{"c":"Pitot","r":"OFF"},{"c":"Comms","r":"GND"},{"s":"Shutdown"},{"c":"Avionics","r":"OFF"},{"c":"Mixture","r":"IDLE"},{"c":"Magnetos","r":"OFF"},{"c":"Electrical Equipment","r":"OFF"},{"c":"Hobbs & Tach","r":"RECORD"},{"c":"Master & Stby","r":"OFF"}],
            "theme":"blue"
        }
    )

    static page0DemoChecklist = new TemplatePage( PageType.checklist, 'Preflight',
        { 
            name:'Preflight',
            theme:'yellow',
            items:[{s:'Cabin',t:"strong"},{c:'Docs AR(R)OW',r:'CHECKED'},{c:'Control Wheel Lock + Pitot Cover',r:'REMOVED'},{c:'Kneeboard, Eyewear',r:'READY'},{c:'Headset, iPad',r:'INSTALLED'},{c:'Sentry, Camera, Power Bank',r:'INSTALLED'},{c:'Section 3',r:'READY'},{c:'Fire Extinguisher',r:'LATCHED'},{s:'Panel'},{c:'Ignition Switch',r:'OFF'},{c:'Avionics',r:'OFF'},{c:'Master Batt',r:'ON'},{c:'Lights + Pitot Heat',r:'ON'},{c:'Flaps',r:'FULL'},{s:'Walk Around',"t":"strong"},{c:'All Lights',r:'CHECKED'},{c:'Antenas (Comm, ELT, Nav, GPS, OAT)',r:'CHECKED'},{c:'Wings (Frost, Ice)',r:'CLEAR'},{c:'Windshield',r:'CLEAN'},{c:'Pitot Tube',r:'HOT'},{s:'Panel'},{c:'Lights + Pitot Heat',r:'OFF'},{c:'Fuel Quantity',r:'CHECKED'},{c:'Hobbs & Tach',r:'RECORD'},{c:'Master Switches',r:'OFF'},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s:'Checklist Capacity',t:"strong"},{c:'Max Items',r:'33'}]
        }
    )
    static page1DemoChecklist = new TemplatePage( PageType.checklist, 'Flight',
        {
            name:"Flight",items:[{"s":"Climb","t":"strong"},{"c":"Power","r":"FULL"},{"c":"Mixture","r":"RICH"},{"c":"Flaps","r":"UP"},{"c":"Engine","r":"GREEN"},{"c":""},{"c":""},{"s":"Approach","t":"strong"},{"c":"Direct","r":"SET"},{"c":"ATIS","r":"GET"},{"c":"Altimeter","r":"SET"},{"c":"RWY HDG","r":"SET"},{"c":"Calls","r":"MADE"},{"c":"Briefing","r":"DONE"},{"c":""},{"s":"Engine FAILURE","t":"emer"},{"c":"Airspeed","r":"68"},{"c":"Fuel Pump","r":"ON"},{"c":"Mixture","r":"RICH"},{"c":"Fuel Shutoff","r":"ON"},{"c":"Fuel Selector","r":"BOTH"},{"c":""},{"s":"Engine FIRE","t":"emer"},{"c":"Mixture","r":"CUTOFF"},{"c":"Fuel Shutoff","r":"OFF"},{"c":"Fuel Pump","r":"OFF"},{"c":"Masters","r":"OFF"},{"c":"Vents, Heat, Air","r":"CLOSED"},{"c":"Emergency Descent","r":"120@30"},{"c":""}],"items2":[{"s":"Cruise","t":"strong"},{"c":"Power","r":"SET"},{"c":"Flaps","r":"UP"},{"c":"Trim","r":"SET"},{"c":"Heading","r":"BUGGED"},{s: "", t: "blank"},{s: "", t: "blank"},{"s":"Before Landing","t":"strong"},{"c":"Fuel Selector","r":"BOTH"},{"c":"Mixture","r":"RICH"},{"c":"Landing Lights","r":"ON"},{"c":"Safety Belts","r":"ON"},{"c":"Auto Pilot","r":"OFF"},{"c":"Cabin Power","r":"OFF"},{"c":""},{"s":"After Landing"},{"c":"Flaps","r":"UP"},{"c":"Light","r":"TAXI"},{"c":"Mixture","r":"Lean"},{"c":"Trim","r":"T/O"},{"c":"Pitot","r":"OFF"},{"c":"Comms","r":"GND"},{"c":""},{"s":"Shutdown"},{"c":"Avionics","r":"OFF"},{"c":"Mixture","r":"IDLE"},{"c":"Magnetos","r":"OFF"},{"c":"Electrical Equipment","r":"OFF"},{"c":"Hobbs & Tach","r":"RECORD"},{"c":"Master & Stby","r":"OFF"},{"t":"blank"},{"t":"blank"},{"t":"blank"},{s:'Checklist Capacity',t:"strong"},{c:'Max Items',r:'70'},],"theme":"blue"
        }
    )
    static page2DemoChecklist = new TemplatePage( PageType.checklist, 'Checklist',
        {
            name:"Checklist","items":[{"s":"Col 1","t":"strong"},{"c":"Challenge1.1","r":"Resp"}],"items2":[{"s":"Col 2","t":"strong"},{"c":"Challenge2.1","r":"Resp"}],"items3":[{"s":"Col 3","t":"strong"},{"c":"Challenge3.1","r":"Resp"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{s: "", t: "blank"},{"s":"Checklist Capacity","t":"strong"},{"c":"Max Items","r":"120"}],"theme":"purple"
        }
    )

    static checklist():Template {
        return new Template('Checklist Demo', 'A C172 preflight Checklist', false, [DemoData.page0DemoChecklist, DemoData.page1DemoChecklist, DemoData.page2DemoChecklist])
    }

    static default():Template {
        return new Template('Default Demo', 'Six Tiles and a Flight Checklist', false, [DemoData.page0DemoDefault, DemoData.page1DemoDefault])
    }

    static holds():Template {
        return new Template('Holds Demo', 'Two sheets of Holds and Compass', false, Array(4).fill(DemoData.page0DemoHold))
    }

    static tiles():Template {
        return new Template('Tiles Demo', 'Every Tile Available on GA Kneeboard', false, [DemoData.page0DemoTiles,DemoData.page1DemoTiles])
    } 
}