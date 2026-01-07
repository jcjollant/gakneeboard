import { describe, expect, it } from '@jest/globals';
import { Checklist, ChecklistItem, ChecklistItemType, ChecklistTheme } from "../src/models/Checklist"
import { ChecklistService } from "../src/services/ChecklistService"

describe('ChecklistService', () => {
    it('Is parsing from editor', () => {

        const input = [
            { text: '', item: new ChecklistItem('', '', '', ChecklistItemType.blank) },
            { text: '##', item: new ChecklistItem('', '', '', ChecklistItemType.alternate) },
            { text: '##Section', item: new ChecklistItem('', '', 'Section', ChecklistItemType.undefined) },
            { text: '##*Section', item: new ChecklistItem('', '', 'Section', ChecklistItemType.strong) },
            { text: '##!Section', item: new ChecklistItem('', '', 'Section', ChecklistItemType.emergent) },
            { text: 'Challenge##Response', item: new ChecklistItem('Challenge', 'Response', '', ChecklistItemType.undefined) },
            { text: 'Challenge', item: new ChecklistItem('Challenge', '', '', ChecklistItemType.undefined) },
            { text: '!Important', item: new ChecklistItem('Important', '', '', ChecklistItemType.emergent) },
            { text: '!Important##Reply', item: new ChecklistItem('Important', 'Reply', '', ChecklistItemType.emergent) },
        ]
        const inputString = input.map((item) => item.text).join('\n')
        const checklist = ChecklistService.parseEditor(inputString)
        const expectedItems = input.map((item) => item.item)
        expect(checklist.items).toEqual(expectedItems)

        const toEditor = ChecklistService.toEditor(checklist)
        expect(toEditor).toEqual(inputString)

        // corner case
        const c2 = ChecklistService.parseEditor('Challenge##')
        expect(c2.items).toEqual([new ChecklistItem('Challenge', '', '', ChecklistItemType.undefined)])
        expect(ChecklistService.toEditor(c2)).toEqual('Challenge')
    })

    it('Is parsing items', () => {
        const input = [
            { c: 'Challenge', r: 'Response', s: '', t: undefined },
            { c: '', r: '', s: 'Section', t: 'strong' },
            { c: '', r: '', s: 'Section', t: undefined },
            { c: '', r: '', s: 'Emergent Section', t: 'emer' },
            { c: 'Important', r: '', s: '', t: 'emer' },
            { c: 'Weather' },
            { c: 'Altimeter', t: 'alt' },
        ]
        const items = ChecklistService.parseItems(input)

        expect(items).toBeDefined()
        if (items) {
            expect(items).toHaveLength(7)
            expect(items[0]).toBeInstanceOf(ChecklistItem)
            expect(items[0].challenge).toBe('Challenge')
            expect(items[1].section).toBe('Section')
            expect(items[1].type).toBe(ChecklistItemType.strong)
            expect(items[3].section).toBe('Emergent Section')
            expect(items[3].type).toBe(ChecklistItemType.emergent)
            expect(items[4].challenge).toBe('Important')
            expect(items[4].type).toBe(ChecklistItemType.emergent)
            expect(items[5].challenge).toBe('Weather')
            expect(items[5].type).toBe(ChecklistItemType.undefined)
            expect(items[6].challenge).toBe('Altimeter')
            expect(items[6].type).toBe(ChecklistItemType.alternate)
        }

        const empty = ChecklistService.parseItems(null)
        expect(empty).toBeUndefined()
    })

    it('Is parsing tile', () => {
        const data = {
            name: 'Power OFF stalls',
            items: [
                { c: "Clearing Turns+Calls", r: "Made" },
                { c: "Visual Reference", r: "Bugged" },
                { c: "Altitude", r: "3,000" },
                { c: "Power=1,600 Flaps > Full" },
                { c: "Hold 65 3s, Level off until stall" },
                { c: "Full Power + Right Rudder" },
                { c: "Flaps 20 > 10 > 0" },
                { c: "ACS HDG/Bank", r: "±10°/20°" }
            ],
            theme: "blue"
        }

        const tile = ChecklistService.parseTile(data)
        expect(tile).toBeDefined()
        expect(tile.name).toBe('Power OFF stalls')
        expect(tile.items).toHaveLength(8)
        expect(tile.items[0].challenge).toBe('Clearing Turns+Calls')
        expect(tile.theme).toBe(ChecklistTheme.blue)
    })

    it('Is converting to editor (Reproduction)', () => {
        const input = [
            { "s": "Climb", "t": "strong" },
            { "c": "Power", "r": "23in" },
            { "c": "Mixture", "t": "alt" },
            { "c": "Prop", "t": "alt" },
            { "c": "Flaps", "t": "alt" },
            { "c": "Engine", "t": "alt" },
            { "s": "Cruise", "t": "strong" },
            { "c": "Power" },
            { "c": "Mix", "t": "alt" },
            { "c": "Trim", "t": "blank" },
            { "c": "Lights", "t": "alt" },
            { "c": "CowlFlaps", "t": "alt" },
            { "s": "Descent", "t": "strong" },
            { "c": "Wx" },
            { "c": "Alt", "t": "alt" },
            { "c": "Nav", "t": "alt" },
            { "c": "Land Lights", "t": "alt" },
            { "c": "Cab Pwr" },
            { "c": "Mix", "t": "alt" },
            { "c": "Apch Brief.", "t": "alt" },
            { "s": "B4 Land.", "t": "strong" },
            { "c": "FuelSel." },
            { "c": "Mix", "t": "alt" },
            { "c": "LanLits", "t": "alt" },
            { "c": "SeatBlt" },
            { "c": "AP", "t": "alt" },
            { "c": "CabPwr", "t": "alt" }
        ]
        const items = ChecklistService.parseItems(input)

        // Ensure items parsed correctly first
        expect(items).toBeDefined()
        if (!items) return

        const checklist = new Checklist(items)

        const text = ChecklistService.toEditor(checklist).split('\n')

        // Basic verification that items are present
        expect(text[0]).toContain('##*Climb')
        expect(text[1]).toContain('Power##23in')
        expect(text[2]).toBe('Mixture')
        expect(text[3]).toBe('Prop')
        expect(text[4]).toBe('Flaps')
        expect(text[5]).toBe('Engine')
        expect(text[6]).toContain('##*Cruise')
        expect(text[7]).toBe('Power')
        expect(text[8]).toBe('Mix')
        expect(text[9]).toBe('Trim')
        expect(text[10]).toBe('Lights')
        expect(text[11]).toBe('CowlFlaps')
        expect(text[12]).toContain('##*Descent')
        expect(text[13]).toBe('Wx')
        expect(text[14]).toBe('Alt')
        expect(text[15]).toBe('Nav')
        expect(text[16]).toBe('Land Lights')
        expect(text[17]).toBe('Cab Pwr')
        expect(text[18]).toBe('Mix')
        expect(text[19]).toBe('Apch Brief.')
        expect(text[20]).toContain('##*B4 Land.')
        expect(text[21]).toBe('FuelSel.')
        expect(text[22]).toBe('Mix')
        expect(text[23]).toBe('LanLits')
        expect(text[24]).toBe('SeatBlt')
        expect(text[25]).toBe('AP')
        expect(text[26]).toBe('CabPwr')
    })
})