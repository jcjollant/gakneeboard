export class ChecklistItem {
    challenge:string;
    response:string;
    section:string;
    type:string;

    constructor(challenge:string='', response:string='', section:string='', type:string='') {
        this.challenge = challenge || '';
        this.response = response || '';
        this.section = section || '';
        this.type = type || '';
    }
    static blank() {
        return new ChecklistItem('', '', '', 'blank')
    }
    static section(name:string, type:string='') {
        return new ChecklistItem('', '', name, type)
    }
}

export class Checklist {
    items:ChecklistItem[];

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
            if( !response) { // there is no separator
                // blank line
                if( !challenge || !challenge.length) return ChecklistItem.blank()
                // Full line with only challenge
                return new ChecklistItem(challenge)
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
                    if( response[0] == '!') return ChecklistItem.section(response.substring(1), 'emer')
                    if( response[0] == '*') return ChecklistItem.section(response.substring(1), 'strong')
                }
                // section [##Section]
                return ChecklistItem.section(response)
            }

            if(challenge[0] == '!') {
                return new ChecklistItem(challenge.substring(1), response, '', 'emer')
            }
            // normal entry
            return new ChecklistItem(challenge, response)
        })
    }

    parseParams(paramItems:any) {
        // sanity check
        if(!paramItems) return [];
        // turn params into ChecklistItems
        this.items = paramItems.map( (item:any) => {
            return new ChecklistItem(item.c, item.r, item.s, item.t)
        })
    }

    toEditor():string {
        // Empty list => Empty text
        if (!this.items.length) return ''

        // translate items into text
        const list = this.items.map(item => {
            if(item.type == 'blank') return ''
            if(item.section.length > 0) {
                if( item.type == 'emer') return '##!' + item.section;
                if( item.type == 'strong') return '##*' + item.section;
                return '##' + item.section;
            }
            const challenge = item.type == 'emer' ? '!' + item.challenge : item.challenge
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
            if(item.type != '') output['t'] = item.type
            return output
        })
    }

}