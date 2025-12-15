export enum AccountType {
    beta = 'beta', 
    private = 'pp', 
    instrument = 'ip',
    simmer='sim',
    hobbs= 'hob',
    lifetime = 'ld',
    unknown = "?"
}

export function parseAccountType(from:string):AccountType {
    switch(from) {
        case 'beta': return AccountType.beta;
        case 'pp': return AccountType.private;
        case 'ip': return AccountType.instrument;
        case 'sim': return AccountType.simmer;
        case 'hob': return AccountType.hobbs;
        case 'lt': return AccountType.lifetime;
        default: return AccountType.unknown;
    }
}