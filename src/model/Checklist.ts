import { Static } from "vue";

export class ChecklistItem {
    challenge:string;
    response:string;
    section:string;
    type:ItemType;

    constructor(challenge:string='', response:string='', section:string='', type:ItemType=ItemType.undefined) {
        this.challenge = challenge || '';
        this.response = response || '';
        this.section = section || '';
        this.type = type || ItemType.undefined;
    }
    static alternate() {
        return new ChecklistItem('', '', '', ItemType.alternate)
    }
    static blank() {
        return new ChecklistItem('', '', '', ItemType.blank)
    }
    static section(name:string, type:ItemType=ItemType.undefined) {
        return new ChecklistItem('', '', name, type)
    }
}

export enum ItemType {
    blank = 'blank',
    alternate = 'alt',
    emergent = 'emer',
    strong = 'strong',
    undefined = '',
}

export class Checklist {
    items:ChecklistItem[];

    static EMERGENT = 'emer'
    static STRONG = 'strong'

    constructor() {
        this.items = []
    }

    static empty() {
        return new Checklist()
    }

    parseEditor(value:string) {
        if (value == '') {
            this.items = []
            return
        }

        this.items = value.split('\n').map(line => {
            let challenge:string;
            let response:string;
            [challenge, response] = line.split('##')
            // console.log('[Checklist.parseEditor] challenge', challenge, 'response', response)

            // blank line
            if( (!response || !response.length) && (!challenge || !challenge.length)) { // there is no separator
                if(line == '##') return ChecklistItem.alternate()
                return ChecklistItem.blank()
            }
            // No challenge
            if (challenge.length == 0) {
                // it can be a section or a blank line
                // [##]
                if(response.length == 0) return new ChecklistItem()
                // it's a section header
                // Test if it's emergent
                if( response.length > 1) {
                    // emergency and strong background
                    if( response[0] == '!') return ChecklistItem.section(response.substring(1), ItemType.emergent)
                    if( response[0] == '*') return ChecklistItem.section(response.substring(1), ItemType.strong)
                }
                // section [##Section]
                return ChecklistItem.section(response)
            }

            if(challenge[0] == '!') {
                return new ChecklistItem(challenge.substring(1), response, '', ItemType.emergent)
            }
            // normal entry
            return new ChecklistItem(challenge, response)
        })
    }

    static parseItemType(source:string):ItemType {
        switch(source) {
            case 'alt': return ItemType.alternate
            case 'emer': return ItemType.emergent
            case 'strong': return ItemType.strong
            case 'blank': return ItemType.blank
            default: return ItemType.undefined
        }
    }

    parseParams(paramItems:any) {
        // sanity check
        if(!paramItems) return [];
        // turn params into ChecklistItems
        this.items = paramItems.map( (item:any) => {
            return new ChecklistItem(item.c, item.r, item.s, Checklist.parseItemType(item.t))
        })
    }

    toEditor():string {
        // Empty list => Empty text
        if (!this.items.length) return ''

        // translate items into text
        const list = this.items.map(item => {
            if(item.type == ItemType.blank) return ''
            if(item.type == ItemType.alternate) return '##'
            if(item.section.length > 0) {
                if( item.type == ItemType.emergent) return '##!' + item.section;
                if( item.type == ItemType.strong) return '##*' + item.section;
                return '##' + item.section;
            }
            const challenge = item.type == ItemType.emergent ? '!' + item.challenge : item.challenge
            if(item.response.length > 0) return challenge + '##' + item.response
            return challenge
        })
        return list.join('\n')
    }

    toParams():any {
        return this.items.map(item => {
            const output = {}
            if(item.challenge != '') output['c'] = item.challenge
            if(item.response != '') output['r'] = item.response
            if(item.section != '') output['s'] = item.section
            if(item.type != ItemType.undefined) output['t'] = item.type
            return output
        })
    }

}