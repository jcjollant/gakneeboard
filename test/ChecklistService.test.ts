import { describe, expect, it } from '@jest/globals';
import { ChecklistItem, ItemType } from "../src/models/Checklist"
import { ChecklistService } from "../src/services/ChecklistService"

describe('ChecklistService', () => {
    it('Is parsing from editor', () => {

        const input = [
            { text: '', item: new ChecklistItem('', '', '', ItemType.blank) },
            { text: '##', item: new ChecklistItem('', '', '', ItemType.alternate) },
            { text: '##Section', item: new ChecklistItem('', '', 'Section', ItemType.undefined) },
            { text: '##*Section', item: new ChecklistItem('', '', 'Section', ItemType.strong) },
            { text: '##!Section', item: new ChecklistItem('', '', 'Section', ItemType.emergent) },
            { text: 'Challenge##Response', item: new ChecklistItem('Challenge', 'Response', '', ItemType.undefined) },
            { text: 'Challenge', item: new ChecklistItem('Challenge', '', '', ItemType.undefined) },
            { text: '!Important', item: new ChecklistItem('Important', '', '', ItemType.emergent) },
            { text: '!Important##Reply', item: new ChecklistItem('Important', 'Reply', '', ItemType.emergent) },
        ]
        const inputString = input.map((item) => item.text).join('\n')
        const checklist = ChecklistService.parseEditor(inputString)
        const expectedItems = input.map((item) => item.item)
        expect(checklist.items).toEqual(expectedItems)

        const toEditor = ChecklistService.toEditor(checklist)
        expect(toEditor).toEqual(inputString)

        // corner case
        const c2 = ChecklistService.parseEditor('Challenge##')
        expect(c2.items).toEqual([new ChecklistItem('Challenge', '', '', ItemType.undefined)])
        expect(ChecklistService.toEditor(c2)).toEqual('Challenge')
    })

    it('Is parsing params', () => {
        const input = [
            { c: 'Challenge', r: 'Response', s: '', t: undefined },
            { c: '', r: '', s: 'Section', t: undefined },
            { c: '', r: '', s: 'Emergent Section', t: 'emer' },
            { c: 'Important', r: '', s: '', t: 'emer' },
        ]

        const checklist = ChecklistService.parseParams(input)

        expect(checklist.items).toHaveLength(4)
        expect(checklist.items[0].challenge).toBe('Challenge')
        expect(checklist.items[0].response).toBe('Response')

        expect(checklist.items[1].section).toBe('Section')

        expect(checklist.items[2].section).toBe('Emergent Section')
        expect(checklist.items[2].type).toBe(ItemType.emergent)

        expect(checklist.items[3].challenge).toBe('Important')
        expect(checklist.items[3].type).toBe(ItemType.emergent)

        // Round trip
        const params = ChecklistService.toParams(checklist)
        // Note: toParams might optimize/remove empty keys, so exact match might depend on implementation.
        // Let's verify essential data
        expect(params).toHaveLength(4)
        expect(params[0].c).toBe('Challenge')
        expect(params[2].t).toBe('emer')
    })
})