import {describe, expect, test} from '@jest/globals';
import { AceChecklist } from '../backend/exporters/AceChecklist'
import { Template } from '../backend/models/Template';
import { TemplateChecklist } from '../backend/exporters/TemplateChecklist';
import { FmdChecklist } from '../backend/exporters/FmdChecklist';

describe( 'Checklist', () => {
    const templateName = "template name"
    const templateDescription = "template description"
    const data = [{"type":"checklist","data":{"name":"Preflight","theme":"yellow","items":[{"s":"Cabin"},{"c":"Docs AR(R)OW","r":"CHECKED"},{"c":"Control Wheel Lock + Pitot Cover","r":"REMOVED"},{"c":"Kneeboard, Eyewear","r":"READY"},{"c":"Headset, iPad","r":"INSTALLED"},{"c":"Sentry, Camera, Power Bank","r":"INSTALLED"},{"c":"Section 3","r":"READY"},{"c":"Fire Extinguisher","r":"LATCHED"},{"s":"Panel"},{"c":"Ignition Switch","r":"OFF"},{"c":"Avionics","r":"OFF"},{"c":"Master Batt","r":"ON"},{"c":"Lights + Pitot Heat","r":"ON"},{"c":"Flaps","r":"FULL"},{"s":"Walk Around"},{"c":"All Lights","r":"CHECKED"},{"c":"Antenas (Comm, ELT, Nav, GPS, OAT)","r":"CHECKED"},{"c":"Wings (Frost, Ice)","r":"CLEAR"},{"c":"Windshield","r":"CLEAN"},{"c":"Pitot Tube","r":"HOT"},{"s":"Panel"},{"c":"Lights + Pitot Heat","r":"OFF"},{"c":"Fuel Quantity","r":"CHECKED"},{"c":"Hobbs & Tach","r":"RECORD"},{"c":"Master Switches","r":"OFF"}]}},{"type":"checklist","data":{"name":"Preflight","theme":"yellow","items":[{"s":"Tail"},{"c":"Tie Down","r":"REMOVED"},{"c":"Control Surface","r":"CHECKED"},{"s":"Right Wing"},{"c":"Tie Down","r":"REMOVED"},{"c":"Control Surface","r":"CHECKED"},{"c":"Main Tire, Wheel Pin, Brake Pad","r":"CHECKED"},{"s":"Nose"},{"c":"Engine Oil (8qt for long flight)","r":"> 6qt"},{"c":"Prop & Spinner","r":"CHECKED"},{"c":"Engine Air Inlets / Belt","r":"CHECKED"},{"c":"Air Filter","r":"CHECKED"},{"c":"Static Source","r":"CHECKED"},{"c":"Front Tire / Shock","r":"CHECKED"},{"s":"Left Wing"},{"c":"Tie Down","r":"REMOVED"},{"c":"Control Surface","r":"CHECKED"},{"c":"Main Tire, Wheel Pin, Brake Pad","r":"CHECKED"},{"c":"Fuel Vent","r":"CHECKED"},{"c":"Stall Warning","r":"CHECKED"},{"s":"Fuel Test"},{"c":"Drain x13 + Smell","r":"TEST"},{"c":"Dipstick measure x2","r":"BOTH"},{"c":"Fuel Cap Seal x2","r":"CHECKED"},{"c":"Fuel Cap Secured x2","r":"CHECKED"}]}},{"type":"checklist","data":{"name":"Flight","items":[{"s":"Climb","t":"strong"},{"c":"Power","r":"FULL"},{"c":"Mixture","r":"RICH"},{"c":"Flaps","r":"UP"},{"c":"Engine","r":"GREEN"},{"c":""},{"c":""},{"s":"Approach","t":"strong"},{"c":"Direct","r":"SET"},{"c":"ATIS","r":"GET"},{"c":"Altimeter","r":"SET"},{"c":"RWY HDG","r":"SET"},{"c":"Calls","r":"MADE"},{"c":"Briefing","r":"DONE"},{"c":""},{"s":"Engine FAILURE","t":"emer"},{"c":"Airspeed","r":"68"},{"c":"Fuel Pump","r":"ON"},{"c":"Mixture","r":"RICH"},{"c":"Fuel Shutoff","r":"ON"},{"c":"Fuel Selector","r":"BOTH"},{"c":""},{"s":"Engine FIRE","t":"emer"},{"c":"Mixture","r":"CUTOFF"},{"c":"Fuel Shutoff","r":"OFF"},{"c":"Fuel Pump","r":"OFF"},{"c":"Masters","r":"OFF"},{"c":"Vents, Heat, Air","r":"CLOSED"},{"c":"Emergency Descent","r":"120@30"},{"c":""}],"items2":[{"s":"Cruise","t":"strong"},{"c":"Power","r":"SET"},{"c":"Flaps","r":"UP"},{"c":"Trim","r":"SET"},{"c":"Heading","r":"BUGGED"},{"c":""},{"c":""},{"s":"Before Landing","t":"strong"},{"c":"Fuel Selector","r":"BOTH"},{"c":"Mixture","r":"RICH"},{"c":"Landing Lights","r":"ON"},{"c":"Safety Belts","r":"ON"},{"c":"Auto Pilot","r":"OFF"},{"c":"Cabin Power","r":"OFF"},{"c":""},{"s":"After Landing"},{"c":"Flaps","r":"UP"},{"c":"Light","r":"TAXI"},{"c":"Mixture","r":"Lean"},{"c":"Trim","r":"T/O"},{"c":"Pitot","r":"OFF"},{"c":"Comms","r":"GND"},{"c":""},{"s":"Shutdown"},{"c":"Avionics","r":"OFF"},{"c":"Mixture","r":"IDLE"},{"c":"Magnetos","r":"OFF"},{"c":"Electrical Equipment","r":"OFF"},{"c":"Hobbs & Tach","r":"RECORD"},{"c":"Master & Stby","r":"OFF"}],"theme":"blue"}},{"type":"checklist","data":{"name":"Emergencies","items":[{"s":"ENGINE FAILURE","t":"strong"},{"c":"Airspeed","r":"68"},{"c":"Fuel Pump","r":"ON"},{"c":"Mixture","r":"RICH"},{"c":"Fuel Shutoff","r":"ON"},{"c":"Fuel Selector","r":"Both"},{"c":""},{"s":"ENGINE FIRE","t":"emer"},{"c":"Mixture","r":"CUTOFF"},{"c":"Fuel Shutoff","r":"OFF"},{"c":"Fuel Pump","r":"OFF"},{"c":"Masters","r":"OFF"},{"c":"Vents, Heat, Air","r":"CLOSED"},{"c":"Emerg. Descent","r":"120@30°"},{"c":""},{"s":"CABIN FIRE","t":"emer"},{"c":"Stby Batt.","r":"OFF"},{"c":"Masters","r":"OFF"},{"c":"Vents, Heat, Air","r":"CLOSED"},{"c":"Fire Ext.","r":"ACTIVATE"},{"c":""},{"s":"EMERGENCY LANDING","t":"strong"},{"c":"Airspeed 68 Trimmed"},{"c":"Best Field (Consider Winds)"},{"c":"Checklist"},{"c":"Declare 121.5+XPDR 7700 + ELT"},{"c":"Seats","r":"SECURE"},{"c":"Belts","r":"ON"},{"c":"Doors","r":"UNLATCH"},{"c":""}],"items2":[{"s":"ICING","t":"strong"},{"c":"Pitot Heat","r":"ON"},{"c":"Altitude","r":"WARM"},{"c":"Cabin Heat","r":"FULL"},{"c":"Defrost Vent","r":"OPEN"},{"c":"Cabin Air","r":"OPEN"},{"c":""},{"s":"ELECTRICAL FIRE","t":"emer"},{"c":"Stby Batt","r":"OFF"},{"c":"Masters","r":"OFF"},{"c":"Vents, Heat, Air","r":"CLOSED"},{"c":"Fire Ext.","r":"ACTIVATE"},{"c":"Avionics","r":"OFF"},{"c":"Electrical Equip.","r":"OFF"},{"c":"Vents, Heat, Air","r":"OPEN"},{"s":"WING FIRE","t":"emer"},{"c":"Wing Lights","r":"OFF"},{"c":"Pitot Heat","r":"OFF"},{"c":""},{"c":""},{"c":""},{"s":"WATER DITCHING","t":"strong"},{"c":"Flaps","r":"20"},{"c":"Airspeed","r":"55kts"},{"c":"Heading","r":"UPWIND"},{"c":"Doors","r":"UNLATCH"},{"c":"Touchdown","r":"LEVEL"},{"c":"ELT","r":"Activate"}],"theme":"blue"}}]
    const template = new Template(0, templateName, data, templateDescription)
    const expectedChecklistCount = 3
    const expectedListData = [
        {length:9,name:'Preflight',sectionLength:[7,5,5,4,2,3,6,5,4],fmdLength:[7,5,5,4,2,3,6,5,4]},
        {length:8,name:'Flight',sectionLength:[6,7,6,7,6,7,7,6],fmdLength:[4,6,5,6,4,6,6,6]},
        {length:8,name:'Emergencies',sectionLength:[6,7,5,8,6,7,5,6],fmdLength:[5,6,4,7,5,7,2,6]}
    ]

    test( 'Template to Checklist', () => {
        // This template has four checklist pages. Two pages have the same name
        const tcList = TemplateChecklist.fromTemplate(template)
        expect(tcList).toBeDefined()
        // we are epecting 3 lists because the first two pages shoud be merged into one big list of 9 sections
        expect(tcList).toHaveLength(expectedChecklistCount)
        for(let index = 0; index < expectedListData.length; index++) {
            const list = tcList[index]
            // check sections counts and list name
            expect(list.sections).toHaveLength(expectedListData[index].length)
            expect(list.name).toBe(expectedListData[index].name)
            // check items count for each section
            for(let index2 = 0; index2 < expectedListData[index].sectionLength.length; index2++) {
                expect(list.sections[index2].items.length).toEqual(expectedListData[index].sectionLength[index2])
            }
        }

    })
    test( 'Template to Fmd', () => {
        const fmdChecklist = FmdChecklist.fromTemplate(template);
        expect(fmdChecklist.objectId).toHaveLength(32);
        expect(fmdChecklist.schemaVersion).toEqual("1.0");
        expect(fmdChecklist.metadata.name).toEqual(templateName);
        expect(fmdChecklist.metadata.detail).toEqual(templateDescription);
        expect(fmdChecklist.metadata.tailNumber).toEqual("");
        expect(fmdChecklist.groups).toHaveLength(3);
        // group 1 is Normal stuff (everything)
        expect(fmdChecklist.groups[0].objectId).toHaveLength(32);
        expect(fmdChecklist.groups[0].groupType).toEqual('normal');
        expect(fmdChecklist.groups[0].items).toHaveLength(expectedChecklistCount);

        for(let index = 0; index < expectedListData.length; index++) {
            const groupList = fmdChecklist.groups[0].items[index]
            // check sections counts and list name
            expect(groupList.objectId).toHaveLength(32);
            expect(groupList.title).toBe(expectedListData[index].name)
            expect(groupList.items).toHaveLength(expectedListData[index].length)
            // check items count for each section
            for(let index2 = 0; index2 < expectedListData[index].sectionLength.length; index2++) {
                expect(groupList.items[index2].items.length).toEqual(expectedListData[index].fmdLength[index2])
            }
        }

        // group 2 and 3 are abnormal and emergency
        expect(fmdChecklist.groups[1].objectId).toHaveLength(32);
        expect(fmdChecklist.groups[1].groupType).toEqual('abnormal');
        expect(fmdChecklist.groups[1].items).toHaveLength(0);
        expect(fmdChecklist.groups[2].objectId).toHaveLength(32);
        expect(fmdChecklist.groups[2].groupType).toEqual('emergency');
        expect(fmdChecklist.groups[2].items).toHaveLength(0);
    })

    test('Template to Ace', () => {
        const aceChecklist = AceChecklist.fromTemplate(template);
        expect(aceChecklist.groups).toHaveLength(1)
        expect(aceChecklist.groups[0].lists).toHaveLength(6)
    })
})