import { DisplayModeAtis, DisplayModeRadios, DisplayModeSunlight, DisplayModeVfr } from "../model/DisplayMode"
import { FrequencyType } from "../model/Frequency"
import { Template, TemplatePage } from "../model/Template"
import { TemplateFormat } from "../model/TemplateFormat"
import { TileType } from "../model/TileType"
import { PageType } from "./PageType"
import { SheetName } from "./sheetData"

export class DemoData {

    static demoRadioData = [
        { mhz: 116.8, name: 'SEA VOR', type: FrequencyType.navaid },
        { mhz: 113.4, name: 'OLM VOR', type: FrequencyType.navaid },
        { mhz: 124.7, name: 'KRNT CTAF', type: FrequencyType.ctaf },
        { mhz: 126.95, name: 'KRNT ATIS', type: FrequencyType.weather },
        { mhz: 123.0, name: 'S43 CTAF', type: FrequencyType.ctaf },
        { mhz: 128.65, name: 'KPAE', type: FrequencyType.weather },
        { mhz: 120.2, name: 'PAE TWR 34R', type: FrequencyType.tower },
        { mhz: 132.95, 'name': 'PAE TWR 34L', type: FrequencyType.tower }
    ]

    static pageHold = new TemplatePage(PageType.tiles, "Holds Practice",
        [
            { id: 0, name: TileType.hold},
            { id: 1, name: TileType.notes, data: { mode: "compass", comp: false } },
            { id: 2, name: TileType.hold},
            { id: 3, name: TileType.notes, data: { mode: "compass", comp: false } },
            { id: 4, name: TileType.hold},
            { id: 5, name: TileType.notes, data: { mode: "compass", comp: false } },
        ]
    )

    static page0DemoTiles = new TemplatePage(PageType.tiles, "Tiles Demo",
        [
            { name: TileType.airport, data: { code: 'krnt', rwy: '16-34' } },
            { name: TileType.airport, data: { code: 'kbfi', rwy: '14L-32R' } },
            { name: TileType.airport, data: { code: 'w39', rwy: 'NE-SW', 'rwyOrientation': 'magnetic' } },
            { name: TileType.airport, data: { code: 'O26', rwy: '13-31' } },
            { name: TileType.atis, data: {} },
            { name: TileType.clearance, data: { mode: 'dep', airport: 'kbfi' } }
        ]
    )

    static page1DemoTiles = new TemplatePage(PageType.tiles, "Tiles",
        [
            { name: TileType.checklist, data: { name: 'Power OFF stalls', items: [{ c: "Clearing Turns+Calls", r: "Made" }, { c: "Visual Reference", r: "Bugged" }, { c: "Altitude", r: "3,000" }, { c: "Power=1,600 Flaps > Full" }, { c: "Hold 65 3s, Level off until stall" }, { c: "Full Power + Right Rudder" }, { c: "Flaps 20 > 10 > 0" }, { c: "ACS HDG/Bank", r: "±10°/20°" }], theme: "blue" } },
            { name: TileType.airport, data: { code: 'kawo', rwy: '16-34' } },
            { name: TileType.sunlight, data: { from: 'KRNT', to: 'KSFF', mode: DisplayModeSunlight.Flight } },
            { name: TileType.vfr, data: { mode: DisplayModeVfr.LostComms } },
            { name: TileType.notes, data: {} },
            { name: TileType.radios, data: DemoData.demoRadioData },
        ]
    )

    static page0DemoDefault = new TemplatePage(PageType.tiles, 'Default',
        [
            { name: TileType.airport, data: { code: "KBFI", rwy: "14L-32R", rwyOrientation: "magnetic", corners: ["weather", "twr", "field", "tpa"] } },
            { name: TileType.airport, data: { code: "KSFF", rwy: "04L-22R", rwyOrientation: "vertical", corners: ["weather", "twr", "field", "tpa"], "pattern": 2 } },
            { name: TileType.radios, data: DemoData.demoRadioData },
            { name: TileType.notes, data: {} },
            { name: TileType.atis, data: {} },
            { name: TileType.clearance, data: { mode: 'dep', airport: 'kbfi' } }
        ]
    )

    static page1DemoDefault = new TemplatePage(PageType.checklist, 'Default',
        {
            name: "Flight",
            "items": [{ s: "Climb", t: "strong" }, { c: "Power", r: "FULL" }, { c: "Mixture", r: "RICH" }, { c: "Flaps", r: "UP" }, { c: "Engine", r: "GREEN" }, { s: "Approach", t: "strong" }, { c: "Direct", r: "SET" }, { c: "ATIS", r: "GET" }, { c: "Altimeter", r: "SET" }, { c: "RWY HDG", r: "SET" }, { c: "Calls", r: "MADE" }, { c: "Briefing", r: "DONE" }, { s: "Engine FAILURE", t: "emer" }, { c: "Airspeed", r: "68" }, { c: "Fuel Pump", r: "ON" }, { c: "Mixture", r: "RICH" }, { c: "Fuel Shutoff", r: "ON" }, { c: "Fuel Selector", r: "BOTH" }, { s: "Engine FIRE", t: "emer" }, { c: "Mixture", r: "CUTOFF" }, { c: "Fuel Shutoff", r: "OFF" }, { c: "Fuel Pump", r: "OFF" }, { c: "Masters", r: "OFF" }, { c: "Vents, Heat, Air", r: "CLOSED" }, { c: "Emergency Descent", r: "120@30" }, { c: "" }],
            "items2": [{ s: "Cruise", t: "strong" }, { c: "Power", r: "SET" }, { c: "Flaps", r: "UP" }, { c: "Trim", r: "SET" }, { c: "Heading", r: "BUGGED" }, { s: "Before Landing", t: "strong" }, { c: "Fuel Selector", r: "BOTH" }, { c: "Mixture", r: "RICH" }, { c: "Landing Lights", r: "ON" }, { c: "Safety Belts", r: "ON" }, { c: "Auto Pilot", r: "OFF" }, { c: "Cabin Power", r: "OFF" }, { s: "After Landing" }, { c: "Flaps", r: "UP" }, { c: "Light", r: "TAXI" }, { c: "Mixture", r: "Lean" }, { c: "Trim", r: "T/O" }, { c: "Pitot", r: "OFF" }, { c: "Comms", r: "GND" }, { s: "Shutdown" }, { c: "Avionics", r: "OFF" }, { c: "Mixture", r: "IDLE" }, { c: "Magnetos", r: "OFF" }, { c: "Electrical Equipment", r: "OFF" }, { c: "Hobbs & Tach", r: "RECORD" }, { c: "Master & Stby", r: "OFF" }],
            "theme": "blue"
        }
    )

    static page0DemoChecklist = new TemplatePage(PageType.checklist, 'Preflight',
        {
            name: 'Preflight',
            theme: 'yellow',
            font: 'large',
            items: [{ s: 'Cabin', t: "strong" }, { c: 'Docs AR(R)OW', r: 'CHECKED' }, { c: 'Control Wheel Lock + Pitot Cover', r: 'REMOVED' }, { c: 'Kneeboard, Eyewear', r: 'READY' }, { c: 'Headset, iPad', r: 'INSTALLED' }, { c: 'Sentry, Camera, Power Bank', r: 'INSTALLED' }, { c: 'Section 3', r: 'READY' }, { c: 'Fire Extinguisher', r: 'LATCHED' }, { s: 'Panel' }, { c: 'Ignition Switch', r: 'OFF' }, { c: 'Avionics', r: 'OFF' }, { c: 'Master Batt', r: 'ON' }, { c: 'Lights + Pitot Heat', r: 'ON' }, { c: 'Flaps', r: 'FULL' }, { s: 'Walk Around', t: "strong" }, { c: 'All Lights', r: 'CHECKED' }, { c: 'Antenas (Comm, ELT, Nav, GPS, OAT)', r: 'CHECKED' }, { c: 'Wings (Frost, Ice)', r: 'CLEAR' }, { c: 'Windshield', r: 'CLEAN' }, { c: 'Pitot Tube', r: 'HOT' }, { s: 'Panel' }, { c: 'Lights + Pitot Heat', r: 'OFF' }, { c: 'Fuel Quantity', r: 'CHECKED' }, { c: 'Hobbs & Tach', r: 'RECORD' }, { c: 'Master Switches', r: 'OFF' }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: 'Checklist Capacity', t: "strong" }, { c: 'Max Items (Large Font)', r: '30' }]
        }
    )
    static page1DemoChecklist = new TemplatePage(PageType.checklist, 'Flight',
        {
            name: "Flight", items: [{ s: "Climb", t: "strong" }, { c: "Power", r: "FULL" }, { c: "Mixture", r: "RICH" }, { c: "Flaps", r: "UP" }, { c: "Engine", r: "GREEN" }, { c: "" }, { c: "" }, { s: "Approach", t: "strong" }, { c: "Direct", r: "SET" }, { c: "ATIS", r: "GET" }, { c: "Altimeter", r: "SET" }, { c: "RWY HDG", r: "SET" }, { c: "Calls", r: "MADE" }, { c: "Briefing", r: "DONE" }, { c: "" }, { s: "Engine FAILURE", t: "emer" }, { c: "Airspeed", r: "68" }, { c: "Fuel Pump", r: "ON" }, { c: "Mixture", r: "RICH" }, { c: "Fuel Shutoff", r: "ON" }, { c: "Fuel Selector", r: "BOTH" }, { c: "" }, { s: "Engine FIRE", t: "emer" }, { c: "Mixture", r: "CUTOFF" }, { c: "Fuel Shutoff", r: "OFF" }, { c: "Fuel Pump", r: "OFF" }, { c: "Masters", r: "OFF" }, { c: "Vents, Heat, Air", r: "CLOSED" }, { c: "Emergency Descent", r: "120@30" }, { c: "" }], "items2": [{ s: "Cruise", t: "strong" }, { c: "Power", r: "SET" }, { c: "Flaps", r: "UP" }, { c: "Trim", r: "SET" }, { c: "Heading", r: "BUGGED" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "Before Landing", t: "strong" }, { c: "Fuel Selector", r: "BOTH" }, { c: "Mixture", r: "RICH" }, { c: "Landing Lights", r: "ON" }, { c: "Safety Belts", r: "ON" }, { c: "Auto Pilot", r: "OFF" }, { c: "Cabin Power", r: "OFF" }, { c: "" }, { s: "After Landing" }, { c: "Flaps", r: "UP" }, { c: "Light", r: "TAXI" }, { c: "Mixture", r: "Lean" }, { c: "Trim", r: "T/O" }, { c: "Pitot", r: "OFF" }, { c: "Comms", r: "GND" }, { c: "" }, { s: "Shutdown" }, { c: "Avionics", r: "OFF" }, { c: "Mixture", r: "IDLE" }, { c: "Magnetos", r: "OFF" }, { c: "Electrical Equipment", r: "OFF" }, { c: "Hobbs & Tach", r: "RECORD" }, { c: "Master & Stby", r: "OFF" }, { t: "blank" }, { t: "blank" }, { t: "blank" }, { s: 'Checklist Capacity', t: "strong" }, { c: 'Max Items (Medium)', r: '70' },], "theme": "blue"
        }
    )
    static page2DemoChecklist = new TemplatePage(PageType.checklist, 'Checklist',
        {
            name: "Checklist", "items": [{ s: "Col 1", t: "strong" }, { c: "Challenge1.1", r: "Resp" }], "items2": [{ s: "Col 2", t: "strong" }, { c: "Challenge2.1", r: "Resp" }], "items3": [{ s: "Col 3", t: "strong" }, { c: "Challenge3.1", r: "Resp" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "", t: "blank" }, { s: "Checklist Capacity", t: "strong" }, { c: "Max (Small)", r: "138" }], "theme": "purple"
        }
    )

    // Skyhawk
    static page0DemoVFR = new TemplatePage(PageType.tiles, 'C172 Reference',
        [
            { name: TileType.airport, data: { code: "0S9", rwy: "09-27", rwyOrientation: "magnetic", corners: ["weather", "twr", "field", "tpa"] } },
            { name: TileType.atis, data: { mode: DisplayModeAtis.CompactATIS } },
            {
                name: TileType.radios, data: [
                    { mhz: 127.750, name: 'KBFI ATIS', type: FrequencyType.weather },
                    { mhz: 118.300, name: 'KBFI TWR', type: FrequencyType.tower },
                    { mhz: 119.025, name: '0S9 AWOS-3P', type: FrequencyType.weather },
                    { mhz: 123.000, name: '0S9 CTAF', type: FrequencyType.ctaf },
                    { mhz: 128.650, name: 'KPAE ATIS', type: FrequencyType.weather },
                    { mhz: 120.200, name: 'KPAE TWR', type: FrequencyType.tower },
                    { mhz: 122.900, name: 'LK WA CTAF', type: FrequencyType.ctaf },
                    { mhz: 118.200, name: 'CHINOOK A MOA' }
                ]
            },
            { name: TileType.checklist, data: { name: "Quick Ref", "items": [ { s: "Climb"}, { c: "Power - Mixture - Flaps - Engine" }, { s: "Cruise"}, { c: "Power - Mixture - Trim - Lights" }, { s: "Descent"}, { c: "Wx - Alt - Nav - Land. Lights" }, { c: "Cab Pwr - Mixt - Apch Brief." }, { s: "Before Landing"}, { c: "Fuel Sel. - Mixt - Land. Lights" }, { c: "Seat Blt - AP - Cab Pwr" } ] , "theme": "blue" } },
            { name: TileType.airport, data: { code: "KRNT", rwy: "16-34", rwyOrientation: "vertical", corners: ["weather", "twr", "field", "tpa"] } },
            { name: TileType.notes, data: {} }
        ]
    )
    static page1DemoVFR = new TemplatePage(PageType.tiles, 'Back Page', [
        { name: TileType.checklist, data: { name: "Limits", items: [{ c: "Vne", r: "163" }, { c: "Va @ 2,550/2,200", r: "105/98" }, { c: "Vno", r: "129" }, { c: "Vfe 10/20", r: "110/85" }, { c: "Vg", r: "68" }, { c: "Vs0/1", r: "40/48" }, { c: "Max XWind", r: "15kts" }, { c: "Landing", r: " 1,300ft" }, { c: "TOW", r: "2,550" }, { s: "", t: "blank" }], "theme": "purple" } },
        { name: TileType.airport, data: { code: "KBFI", rwy: "14L-32R", rwyOrientation: "vertical", corners: ["weather", "twr", "field", "tpa"] } },
        { name: TileType.radios, data: { mode: DisplayModeRadios.LostComms, list: [] } },
        { name: TileType.sunlight, data: { from: "0S9", to: "0S9", mode: DisplayModeSunlight.Flight } },
        { name: TileType.atis, data: { mode: DisplayModeAtis.Categories } },
        { name: TileType.atis, data: { mode: DisplayModeAtis.CloudClearance } }
    ]
    )

    static page0DemoNavlog = new TemplatePage(PageType.navLog, 'Front Page', {
        "from": "KRNT",
        "to": "KELN",
        "tt": 52.68333333333334,
        "td": 77.80000000000001,
        "entries": [
            { name: "KRNT", "alt": 32, "th": 144, "mh": 129, "ld": 4.2, "lt": 3.5, "lf": 2.4, "att": "+", "gs": 71, "fr": 53 },
            { name: "TOC25", "alt": 2500, "th": 143, "mh": 128, "ld": 2.9, "lt": 1.65, "lf": 0.2, "gs": 106, "fr": 50.6 },
            { name: "Lk Youngs Zebku", "alt": 2500, "th": 90, "mh": 75, "ld": 4, "lt": 3.5, "lf": 0.7, "att": "+", "gs": 68, "fr": 50.4 },
            { name: "TOC45", "alt": 4500, "th": 90, "mh": 75, "ld": 1, "lt": 0.6166666666666667, "lf": 0.1, "gs": 101, "fr": 49.699999999999996 },
            { name: "Clear B Sh50", "alt": 4500, "th": 90, "mh": 75, "ld": 2.2, "lt": 2, "lf": 0.4, "att": "+", "gs": 67, "fr": 49.599999999999994 },
            { name: "TOC55", "alt": 5500, "th": 90, "mh": 75, "ld": 4.5, "lt": 2.8, "lf": 0.4, "gs": 96, "fr": 49.199999999999996 },
            { name: "Clear B Sh60", "alt": 5500, "th": 90, "mh": 75, "ld": 4.4, "lt": 4, "lf": 0.8, "att": "+", "gs": 66, "fr": 48.8 },
            { name: "TOC75", "alt": 7500, "th": 90, "mh": 75, "ld": 7.6, "lt": 4.9, "lf": 0.6, "gs": 94, "fr": 48 },
            { name: "Bandera 4W0", "alt": 7500, "th": 90, "mh": 75, "ld": 28.8, "lt": 18.25, "lf": 2.4, "gs": 95, "fr": 47.4 },
            { name: "TOD", "alt": 7500, "th": 81, "mh": 66, "ld": 18.2, "lt": 11.466666666666667, "lf": 1.5, "att": "-", "gs": 95, "fr": 45 },
            { name: "KELN", "alt": 1763.2, "ld": 0, "lt": 0, "lf": 0 }
        ],
        ff: 53,
        fr: 13.5,
        ft: 43.5,
        mv: -15,
        md: 0,
        cta: 105,
        cff: 9,
        dr: 500,
        dff: 6,
    })


    static page1DemoNavlog = new TemplatePage(PageType.tiles, 'Back Page', [
        { "id": 0, name: "airport", data: { code: "krnt", "rwy": "16-34" } },
        { "id": 1, name: "atis", data: { "mode": "compact" } },
        { "id": 2, name: "radios", data: [{ "mhz": "122.9", name: "CTAF" }, { "mhz": "135.275", name: "Stamp. Pass" }, { "mhz": "117.9", name: "ELN VOR" }, { "mhz": "123", name: "KELN CTAF" }, { "mhz": "116.8", name: "SEA VORTAC" }, { "mhz": "126.95", name: "KRNT ATIS" }, { "mhz": "124.7", name: "KRNT TWR" }] },
        { "id": 3, name: "notes", data: {} },
        { "id": 4, name: "airport", data: { code: "KELN", "rwy": "11-29", "rwyOrientation": "magnetic", "corners": ["weather", "twr", "field", "tpa"] } },
        { "id": 5, name: "navlog", data: {} }
    ])



    static page0DemoReference = new TemplatePage(PageType.tiles, 'Reference 1', [
        {name:"vfr",data:{mode:"clouds","airport":""}},
        {name:"atis",data:{mode:"categories"}},
        {name:"vfr",data:{mode:"alt","airport":""}},
        {name:"sunlight",data:{mode:"ref"}},
        {name:"vfr",data:{mode:"nordo","airport":""}},
        {name:"checklist",data:{name:"Checklist","items":[{c:"Vne","r":"163"},{c:"Vno","r":"129"},{c:"Va @ 2,550","r":"105"},{c:"Va @ 2,200","r":"98"},{c:"Va @ 1,900","r":"90"},{c:"Vy","r":"74"},{c:"Vg","r":"68"},{c:"Vx","r":"62"},{c:"Vs1","r":"48"},{c:"Vs0","r":"40"}],"theme":"blue"}}
    ])

    static ifrReportingList0 = [{c:"Missed","r":"M"},{c:"Airspeed ±10kts ","r":"A"},{c:"Reaching Fix","r":"R"},{c:"Vacating Altitude","r":"V"},{c:"ETA ±2min","r":"E"},{c:"Leaving Hold","r":"L"},{c:"Outer Marker","r":"O"},{c:"Unforecasted Weather","r":"U"},{c:"Safety of flight","r":"S"},{c:"VFR on Top","r":"V"},{c:"Final Approach Fix","r":"F"}]
    static ifrReportingList1 = [{c:"Radio nav Equip. Failure","r":"R"},{c:"Compulsory Reporting","r":"C"},{c:"Unable to hold 500fpm","r":"500"},{s:" Do Not Fly a PT"},{c:"Straight In Approach","r":"S"},{c:"Hold in lieu of PT","r":"H"},{c:"DME Arc","r":"A"},{c:"Radar Vector to FAF","r":"R"},{c:"No PT on chart","r":"P"},{c:"Timed Apch from Hold","r":"T"},{c:"Teardrop Course Rev.","r":"T"}]
    static page1DemoReference = new TemplatePage(PageType.tiles, 'Reference 2', [
        {name:"clearance","data":{mode:"alt","airport":""}},
        {name:"checklist","data":{name:"IFR Reporting","items":this.ifrReportingList0,"theme":"yellow"}},
        {name:"clearance","data":{mode:"lostcomms","airport":""}},
        {name:"checklist","data":{name:"Continued","items":this.ifrReportingList1,"theme":"yellow"}},
        {name:"radios","data":{mode:"sv","list":[],"sv":"h"}},
        {name:"radios","data":{mode:"sv","list":[],"sv":"vh"}}
    ])


    static page0Acronyms = new TemplatePage(PageType.checklist, 'Acronyms 1',
        {
            name: "Acronyms 1",
            "items": [
                { s: "PAVE", t: "strong" }, { c: "Pilot", "r": "P" }, { c: "Aircraft", "r": "A" }, { c: "Environment", "r": "V" }, { c: "External Factors", "r": "E" }, { t: "blank" }, { s: "Pilot Legal", t: "strong" }, { c: "Pilot Certificate", "r": "P" }, { c: "Current Medical", "r": "M" }, { c: "Government ID", "r": "G" }, { t: "blank" }, { s: "Pilot Safe", t: "strong" }, { c: "Illness", "r": "I" }, { c: "Medication", "r": "M" }, { c: "Stress", "r": "S" }, { c: "Alcohol", "r": "A" }, { c: "Fatigue", "r": "F" }, { c: "Emotions", "r": "E" }, { t: "blank" }, { s: "Pilot Current", t: "strong" }, { c: "Flight Review", "r": "24mo" }, { c: "Carry Passengers", "r": "3 T/O" }, { c: "Night Passengers", "r": "Full Stop" }, { s: "Instruments" }, { c: "Instrument Approaches", "r": "6" }, { c: "Hold procedure", "r": "H" }, { c: "Intercept Course", "r": "I" }, { c: "Track Course", "r": "T" }
            ],
            "items2": [
                { s: "Aircraft Legal", t: "strong" }, { c: "Minimum Equipment List", "r": "M" }, { c: "Airworthiness", "r": "A" }, { c: "Registration", "r": "R" }, { c: "Radio License (Intl)", "r": "R" }, { c: "Operating Handbook", "r": "O" }, { c: "Weight and Balance", "r": "W" }, { c: "Placards", "r": "P" }, { c: "Compass Deviation Card", "r": "C" }, { c: "GPS Manual", "r": "G" }, { s: "Aircraft Current", t: "strong" }, { c: "Airworthiness Directives", "r": "A" }, { c: "VOR: 30d", "r": "V" }, { c: "Inspections: 12mo+100h", "r": "I" }, { c: "Altimeter: 24mo", "r": "A" }, { c: "Transponder: 24mo", "r": "T" }, { c: "ELT: 12mo+1h+Half Batt", "r": "E" }, { c: "Static System: 24mo", "r": "S" }, { s: "Environment", t: "strong" }, { c: "NOTAMs", "r": "N" }, { c: "Weather", "r": "W" }, { c: "Known ATC Delays", "r": "K" }, { c: "Runway Length and Slope", "r": "R" }, { c: "Alternates", "r": "A" }, { c: "Fuel Requirement", "r": "F" }, { c: "T/o and Landgin dist.", "r": "T" }, { t: "blank" }
            ],
            "theme": "grey"
        }
    )

    static page1Acronyms = new TemplatePage(PageType.checklist, 'Acronyms 2',
        {
            name: "Acronyms 2",
            "items": [
                { s: "Equipment List", t: "strong" }, { c: "MEL > Type Cert > AD > SB > KOEL" }, { s: "VFR Day" }, { c: "Airspeed Indicator", "r": "A" }, { c: "Tachometer", "r": "T" }, { c: "Oil Pressure Gauge", "r": "O" }, { c: "Manifold Pressure", "r": "M" }, { c: "Altimeter", "r": "A" }, { c: "Temperature Gauge", "r": "T" }, { c: "Oil Temp Gauge", "r": "O" }, { c: "Fuel Gauge", "r": "F" }, { c: "Landing Gear Indicator", "r": "L" }, { c: "Anti Collision Light", "r": "A" }, { c: "Magnetic Compass", "r": "M" }, { c: "ELT", "r": "E" }, { c: "Safety Belts", "r": "S" }, { s: "VFR Night" }, { c: "Fuses", "r": "F" }, { c: "Landing Lights", "r": "L" }, { c: "Anti Collision Lights", "r": "A" }, { c: "Position Lights", "r": "P" }, { c: "Source of Electricity", "r": "S" }, { s: "IFR" }, { c: "Generator (Alt.)", "r": "G" }, { c: "Radios (VOR, GPS, )", "r": "R" }, { c: "Altimeter", "r": "A" }, { c: "Ball", "r": "B" }, { c: "Clock", "r": "C" }, { c: "Attitude Indicator", "r": "A" }, { c: "Rate of Turn", "r": "R" }, { c: "Directional Gyro", "r": "D" }
            ],
            "items2": [
                { s: "Types of class E", t: "strong" }, { c: "Surface", "r": "S" }, { c: "Extension", "r": "E" }, { c: "Transition 700 AGL", "r": "T" }, { c: "Victor Airways", "r": "V" }, { c: "Offshore", "r": "O" }, { c: "Domestic Enroute", "r": "D" }, { c: "Above 14,500 and FL 600", "r": "A" }, { t: "blank" }, { s: "VFR Altitudes (91.159)", t: "strong" }, { c: "Winds", "r": "W" }, { c: "Hemispheric Rule", "r": "H" }, { c: "Airspace", "r": "A" }, { c: "Terrain", "r": "T" }, { c: "Gliding Distance", "r": "G" }, { c: "Performance", "r": "P" }, { c: "Trip Length", "r": "T" }, { t: "blank" }, { s: "Pax Briefing", t: "strong" }, { c: "Seat and Belt", "r": "S" }, { c: "Air Vents", "r": "A" }, { c: "Fire Extinguisher", "r": "F" }, { c: "Exit Doors", "r": "E" }, { c: "Talking", "r": "T" }, { c: "Your Questions", "r": "Y" }
            ],
            "theme": "blue"
        }

    )

    static page2Acronyms = new TemplatePage(PageType.checklist, 'Acronyms 3',
        {
            name: "Acronyms 3",
            "items": [{s: "Left Turning Tendencies", t: "strong"}, {c: "Gyroscopic", "r": "G"}, {c: "Asymmetric Thrust", "r": "A"}, {c: "Spiraling Slipstream", "r": "S"}, {c: "Torque", "r": "T"}, {t: "blank"}, {s: "Aircraft Registration Expiry", t: "strong"}, {c: "30 days post passing", "r": "30"}, {c: "Foreign Export", "r": "F"}, {c: "Transfer", "r": "T"}, {c: "Destruction", "r": "D"}, {c: "US Citizenship revoked", "r": "U"}, {c: "Cancelled", "r": "C"}, {c: "7 Years", "r": "K"}, {t: "blank"}, {s: "5Ps", t: "strong"}, {c: "Plan", "r": "P"}, {c: "Programming", "r": "P"}, {c: "Plane", "r": "P"}, {c: "Pilot", "r": "P"}, {c: "Passenger", "r": "P"}, {t: "blank"}, {s: "Decide", t: "strong"}, {c: "Detect", "r": "D"}, {c: "Evaluate", "r": "E"}, {c: "Choose Outcome", "r": "C"}, {c: "Identify Action", "r": "I"}, {c: "Do", "r": "D"}, {c: "Evaluate Effect", "r": "E"}],
            "items2": [{s: " Reporting to ATC", t: "strong"}, {c: "Missed", "r": "M"}, {c: "Airspeed ±10kts", "r": "A"}, {c: "Reaching Fix", "r": "R"}, {c: "VFR on top", "r": "V"}, {c: "ETA ±2min", "r": "E"}, {c: "Leaving Hold", "r": "L"}, {c: "Outer Marker", "r": "O"}, {c: "Unforcasted Weather", "r": "U"}, {c: "Safety of Flight", "r": "S"}, {c: "Vacating Altitude", "r": "V"}, {c: "Final Approach Fix", "r": "F"}, {c: "Radial nav Equip. Failure", "r": "R"}, {c: "Compulsory Reporting", "r": "C"}, {c: "Unable to hold 500fpm", "r": "500"}, {t: "blank"}, {s: " Do No Fly A Procedure", t: "strong"}, {c: "Straight In Approach", "r": "S"}, {c: "Hold in lieu of PT", "r": "H"}, {c: "DME Arc", "r": "A"}, {c: "Radar Vector to FAF", "r": "R"}, {c: "No PT on chart", "r": "P"}, {c: "Timed Apch from a Hold", "r": "T"}, {c: "Teardrop Course Reversal", "r": "T"}, {t: "blank"}, {s: "Illusions", t: "strong"}, {c: "Inversion", "r": "I"}, {c: "Coriolis", "r": "C"}, {c: "Elevator", "r": "E"}, {c: "False Horizon", "r": "F"}, {c: "Lean", "r": "L"}, {c: "Autokinesis", "r": "A"}, {c: "Graveyard Spin", "r": "G"}, {c: "Somatogravic", "r": "S"}, {t: "blank"}],
            "theme": "yellow"
        }
    )

    static page0IFRFlight = new TemplatePage(PageType.tiles, 'Tile 1',
        [
            {name:"clearance",data:{"mode":"dep","airport":"KPAE"},"span2":false,"hide":false},
            {name:"radios",data:{"mode":"","list":[{"value":"135.625",name:"KAWO AWOS-3PT","type":"w"},{"value":"122.725",name:"KAWO CTAF","type":"ct"},{"value":"111.500",name:"KAWO LOC I-AWO 34","type":"n"},{"value":"120.200",name:"KPAE TWR","type":"tw"}],"sv":"t"},"span2":false,"hide":false},
            {name:"atis",data:{"mode":""},"span2":true,"hide":false},
            {name:"atis",data:{"mode":""},"span2":false,"hide":true},
            {name:"notes",data:{"mode":"word","word":"WARNMM"},"span2":true,"hide":false},
            {name:"notes",data:{"mode":"word","word":"LaWBB","comp":false},"span2":false,"hide":true}
        ]
    )

    static page1IFRFlight = new TemplatePage(PageType.tiles, 'Tile 2',
        [
            {name:"checklist",data:{name:"IFR Reporting","items":this.ifrReportingList0,"theme":"yellow"},"span2":false,"hide":false},
            {name:"checklist",data:{name:"IFR Reporting Cont'd","items":this.ifrReportingList1,"theme":"yellow"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KAWO","rwy":"11-29","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"clearance",data:{"mode":"alt"}},
            {name:"notes",data:{"mode":"word","word":"WARNMM"},"span2":true,"hide":false},
            {name:"notes",data:{"mode":"word","word":"LaWBB","comp":false},"span2":false,"hide":true}
        ]
    )

    static page2IFRFlight = new TemplatePage(PageType.approach, "Approach 1", {"airport":"S43","pdf":0})
    // static page3IFRFlight = new TemplatePage(PageType.approach, "Approach 2", {"airport":"KAWO","pdf":1})

    static page0SeattleAirports = new TemplatePage(PageType.tiles, 'Page1',
        [
            {name:"airport",data:{code:"KBFI","rwy":"14R-32L","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KBFI","rwy":"14L-32R","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KRNT","rwy":"16-34","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KPWT","rwy":"02-20","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"magnetic","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KTIW","rwy":"17-35","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"0S9","rwy":"09-27","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KOLM","rwy":"08-26","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"magnetic","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KOLM","rwy":"17-35","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"magnetic","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"S50","rwy":"17-35","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KPAE","rwy":"16R-34L","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KPAE","rwy":"16L-34R","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"S36","rwy":"15-33","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false}
        ]
    )
    static page1SeattleAirports = new TemplatePage(PageType.tiles, 'Page2',
        [
            {name:"airport",data:{code:"KBLI","rwy":"16-34","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KCLS","rwy":"16-34","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KFHR","rwy":"16-34","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"magnetic","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"S43","rwy":"15L-33R","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KPLU","rwy":"17-35","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KHQM","rwy":"06-24","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KAWO","rwy":"11-29","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"magnetic","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KAWO","rwy":"16-34","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"magnetic","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KELN","rwy":"11-29","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"W10","rwy":"16-34","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"KORS","rwy":"16-34","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false},
            {name:"airport",data:{code:"74S","rwy":"18-36","pattern":0,"corners":["weather","twr","field","tpa","#FCD/P","#FGND","?Custom?Custom","#FUNICOM"],"rwyOrientation":"vertical","headings":true,"mode":"one"},"span2":false,"hide":false}
        ]
    )

    static pagePaperNavlog = new TemplatePage(PageType.paperNavlog, 'Paper NavLog')

    static acronyms(): Template {
        return new Template('Acronyms', 'Popular Acronyms', false, [DemoData.page0Acronyms, DemoData.page1Acronyms, DemoData.page2Acronyms])
    }

    static blank(): Template {
        return new Template('Blank', '', false, [TemplatePage.SELECTION, TemplatePage.SELECTION])
    }

    static charts(): Template {
        const page0DemoCharts = new TemplatePage(PageType.diagram, 'Airport Diagram', { airport: "KRNT" })
        const page1DemoCharts = new TemplatePage(PageType.approach, 'Approach Plate', { airport: "KRNT", pdf: 0 })
        return new Template('Charts', 'Airport Diagram and Instrument Approach', false, [page0DemoCharts, page1DemoCharts])
    }

    static checklist(): Template {
        return new Template('Checklists', 'A C172 preflight Checklist', false, [DemoData.page0DemoChecklist, DemoData.page1DemoChecklist, DemoData.page2DemoChecklist])
    }

    static default(): Template {
        return new Template('Default Demo', 'Six Tiles and a Flight Checklist', false, [DemoData.page0DemoDefault, DemoData.page1DemoDefault])
    }

    static fromName(name: string): Template | undefined {// turn a default name into its data or null if the name is unkown
        if (name == SheetName.default) {
            return DemoData.default()
        } else if (name == SheetName.acronyms) {
            return DemoData.acronyms()
        } else if (name == SheetName.tiles) {
            return DemoData.tiles()
        } else if (name == SheetName.checklist) {
            return DemoData.checklist()
        } else if (name == SheetName.navlog) {
            return DemoData.navlog()
        } else if (name == SheetName.new) {
            return DemoData.blank()
        } else if (name == SheetName.vfrFlight) {
            return DemoData.skyhawk()
        } else if (name == SheetName.charts) {
            return DemoData.charts()
        } else if (name == SheetName.holds) {
            return DemoData.holds()
        } else if (name == SheetName.ifrFlight) {
            return DemoData.ifrflight()
        } else if (name == SheetName.ifrStrips) {
            return DemoData.ifrstrips()
        } else if(name == SheetName.reference) {
            return DemoData.reference()
        } else if(name == SheetName.seattle) {
            return DemoData.seattleAirports()
        } else if(name == SheetName.paperNavlog) {
            return DemoData.paperNavlog()
        }
        return undefined;
    }

    static holds(): Template {
        return new Template('Holds Demo', 'Two sheets of Holds and Compass', false, Array(4).fill(DemoData.pageHold))
    }

    static ifrflight(): Template {
        return new Template('IFR Flight', 'IFR Reference Template', false, [DemoData.page0IFRFlight, DemoData.page1IFRFlight, DemoData.page2IFRFlight])
    }

    static ifrstrips(): Template {
        const page0 = new TemplatePage(PageType.strips, 'IFR Training Strips', [
            { type: 'radio'}, {type: 'craft'}, {type: 'atis'}, {type: 'atis'}, {type: 'atis'}, {type: 'atis'}, {type: 'atis'}, {type: 'notes'}] )
        const page1 = new TemplatePage(PageType.flightDebrief, "IFR Training Debrief")

        return new Template('IFR Training', 'Use it for multiple approaches in one flight', false, [page0, page1])
    }

    static navlog(): Template {
        return new Template('Navlog Demo', 'Navlog page along with six tiles', false, [DemoData.page0DemoNavlog, DemoData.page1DemoNavlog])
    }

    static reference(): Template {
        return new Template('Reference Card', 'Two Pages of References Tiles', false, [DemoData.page0DemoReference, DemoData.page1DemoReference])
    }

    static seattleAirports(): Template {
        return new Template('Seattle Airports', '24 Seattle area GA airports (Full Page)', false, [DemoData.page0SeattleAirports, DemoData.page1SeattleAirports], TemplateFormat.FullPage)
    }

    static skyhawk(): Template {
        return new Template('VFR Flight', 'VFR Reference Template', false, [DemoData.page0DemoVFR, DemoData.page1DemoVFR])
    }

    static tiles(): Template {
        return new Template('Tiles Demo', 'Every Tile Available on GA Kneeboard', false, [DemoData.page0DemoTiles, DemoData.page1DemoTiles])
    }

    static paperNavlog(): Template {
        return new Template('Paper Navlog', 'Printable Paper Navlog Template', false, [DemoData.pagePaperNavlog], TemplateFormat.FullPage)
    }
}