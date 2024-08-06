export function itemsFromList(value) {
    if (value == '') return []
    const items = value.split('\n').map(line => {
        let challenge;
        let response;
        [challenge, response] = line.split('##')
        if (challenge == undefined || response == undefined) return { c: '?', r: '?' }
        // is this a section?
        if (challenge.length == 0) return { s: response }
        return { c: challenge, r: response }
    })
    return items;
}

export function listFromItems(items) {
    if (!items) return ''

    // translate items into text
    const list = items.map(item => {
        if ('s' in item) return '##' + item.s;
        return item.c + '##' + item.r
    })
    return list.join('\n')
}

