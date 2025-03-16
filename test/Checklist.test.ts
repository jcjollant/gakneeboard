import {describe, expect} from '@jest/globals';
import { Checklist, ChecklistItem, ItemType } from "../src/model/Checklist"

describe( 'Checklist', () => {
    it('Is parsing from editor', () => {

        const checklist = new Checklist()
        const input = [
            {text:'',item:new ChecklistItem('','','',ItemType.blank)},
            {text:'##',item:new ChecklistItem('','','',ItemType.alternate)},
            {text:'##Section',item:new ChecklistItem('','','Section',ItemType.undefined)},
            {text:'##*Section',item:new ChecklistItem('','','Section',ItemType.strong)},
            {text:'##!Section',item:new ChecklistItem('','','Section',ItemType.emergent)},
            {text:'Challenge##Response',item:new ChecklistItem('Challenge','Response','',ItemType.undefined)},
            {text:'Challenge',item:new ChecklistItem('Challenge','','',ItemType.undefined)},
            {text:'!Important',item:new ChecklistItem('Important','','',ItemType.emergent)},
            {text:'!Important##Reply',item:new ChecklistItem('Important','Reply','',ItemType.emergent)},
        ]
        const inputString = input.map((item) => item.text).join('\n')
        checklist.parseEditor(inputString)
        const expectedItems = input.map((item) => item.item)
        expect(checklist.items).toEqual(expectedItems)

        const toEditor = checklist.toEditor()
        expect(toEditor).toEqual(inputString)

        // corner case
        const c2 = new Checklist()
        c2.parseEditor('Challenge##')
        expect(c2.items).toEqual([new ChecklistItem('Challenge','','',ItemType.undefined)])
        expect(c2.toEditor()).toEqual('Challenge')
    })
})