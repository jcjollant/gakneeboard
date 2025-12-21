import { describe, expect, it } from '@jest/globals';
import { ChecklistItem, ChecklistItemType, ChecklistTheme } from "../src/models/Checklist"
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
        ]
        const items = ChecklistService.parseItems(input)

        expect(items).toBeDefined()
        if (items) {
            expect(items).toHaveLength(5)
            expect(items[0]).toBeInstanceOf(ChecklistItem)
            expect(items[0].challenge).toBe('Challenge')
            expect(items[1].section).toBe('Section')
            expect(items[1].type).toBe(ChecklistItemType.strong)
            expect(items[3].section).toBe('Emergent Section')
            expect(items[3].type).toBe(ChecklistItemType.emergent)
            expect(items[4].challenge).toBe('Important')
            expect(items[4].type).toBe(ChecklistItemType.emergent)
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
})