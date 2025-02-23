export enum AccountType {
    beta = 'beta', 
    private = 'pp', 
    instrument = 'ip',
    simmer='sim',
    unknown = "?"
}

export function parseAccountType(from:string):AccountType {
    switch(from) {
        case 'beta': return AccountType.beta;
        case 'pp': return AccountType.private;
        case 'ip': return AccountType.instrument;
        case 'sim': return AccountType.simmer;
        default: return AccountType.unknown;
    }
}