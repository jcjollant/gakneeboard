export function itemsFromList(value) {
    if (value == '') return []
    const items = value.split('\n').map(line => {
        let challenge;
        let response;
        [challenge, response] = line.split('##')
        if( response == undefined) { // there is no separator
            if( challenge == undefined) return {c:'?'}
            // Full line with only challenge
            return { c:challenge}  
        }
        // No challenge
        if (challenge.length == 0) {
            // it can be a section or a blank line
            // [##]
            if(response.length == 0) return {c:'', r:''}
            // it's a section header
            // Test if it's emergent
            if( response.length > 0 && response[0] == '!') {
                return {s:response.substring(1), t:'emer'}
            }
            // section [##Section]
            return { s: response }
        }

        // normal entry
        return { c: challenge, r: response }
    })
    return items;
}

export function listFromItems(items) {
    if (!items) return ''

    // translate items into text
    const list = items.map(item => {
        if ('s' in item) {
            if( item.t == 'emer') return '!' + item.s
            return '##' + item.s;
        }
        if ('r' in item) return item.c + '##' + item.r
        return item.c
    })
    return list.join('\n')
}

