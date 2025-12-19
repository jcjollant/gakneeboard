import { Checklist, ChecklistItem, ItemType } from "../models/Checklist";

export class ChecklistService {

    static parseEditor(value: string): Checklist {
        const checklist = new Checklist();
        if (value == '') {
            checklist.items = []
            return checklist
        }

        checklist.items = value.split('\n').map(line => {
            let challenge: string;
            let response: string;
            [challenge, response] = line.split('##')

            // blank line
            if ((!response || !response.length) && (!challenge || !challenge.length)) { // there is no separator
                if (line == '##') return ChecklistItem.alternate()
                return ChecklistItem.blank()
            }
            // No challenge
            if (challenge.length == 0) {
                // it can be a section or a blank line
                // [##]
                if (response.length == 0) return new ChecklistItem()
                // it's a section header
                // Test if it's emergent
                if (response.length > 1) {
                    // emergency and strong background
                    if (response[0] == '!') return ChecklistItem.section(response.substring(1), ItemType.emergent)
                    if (response[0] == '*') return ChecklistItem.section(response.substring(1), ItemType.strong)
                }
                // section [##Section]
                return ChecklistItem.section(response)
            }

            if (challenge[0] == '!') {
                return new ChecklistItem(challenge.substring(1), response, '', ItemType.emergent)
            }
            // normal entry
            return new ChecklistItem(challenge, response)
        })
        return checklist;
    }

    static parseItemType(source: string): ItemType {
        switch (source) {
            case 'alt': return ItemType.alternate
            case 'emer': return ItemType.emergent
            case 'strong': return ItemType.strong
            case 'blank': return ItemType.blank
            default: return ItemType.undefined
        }
    }

    static parseParams(paramItems: any): Checklist {
        const checklist = new Checklist();
        // sanity check
        if (!paramItems) return checklist;
        // turn params into ChecklistItems
        checklist.items = paramItems.map((item: any) => {
            return new ChecklistItem(item.c, item.r, item.s, ChecklistService.parseItemType(item.t))
        })
        return checklist;
    }

    static toEditor(checklist: Checklist): string {
        // Empty list => Empty text
        if (!checklist.items.length) return ''

        // translate items into text
        const list = checklist.items.map(item => {
            if (item.type == ItemType.blank) return ''
            if (item.type == ItemType.alternate) return '##'
            if (item.section.length > 0) {
                if (item.type == ItemType.emergent) return '##!' + item.section;
                if (item.type == ItemType.strong) return '##*' + item.section;
                return '##' + item.section;
            }
            const challenge = item.type == ItemType.emergent ? '!' + item.challenge : item.challenge
            if (item.response.length > 0) return challenge + '##' + item.response
            return challenge
        })
        return list.join('\n')
    }

    static toParams(checklist: Checklist): any {
        return checklist.items.map(item => {
            const output: any = {}
            if (item.challenge != '') output['c'] = item.challenge
            if (item.response != '') output['r'] = item.response
            if (item.section != '') output['s'] = item.section
            if (item.type != ItemType.undefined) output['t'] = item.type
            return output
        })
    }
}
