export enum AccountType {
    beta = 'beta',
    student = 'sp',
    private = 'pp',
    instrument = 'ip',
    simmer = 'sim',
    hobbs = 'hob',
    lifetime = 'ld',
    unknown = "?"
}

export function parseAccountType(from: string): AccountType {
    switch (from) {
        case 'beta': return AccountType.beta;
        case 'sp': return AccountType.student;
        case 'pp': return AccountType.private;
        case 'ip': return AccountType.instrument;
        case 'sim': return AccountType.simmer;
        case 'hob': return AccountType.hobbs;
        case 'ld': return AccountType.lifetime; // Fixed typo 'lt' -> 'ld' from original file if any, checking original UI file... UI had 'lt' -> AccountType.lifetime ('ld'). I should probably stick to 'ld' as string value is 'ld'.
        case 'lt': return AccountType.lifetime; // Keeping legacy support if needed, but the enum says 'ld'. UI code had `case 'lt': return AccountType.lifetime;` where `lifetime = 'ld'`. This implies 'lt' might be used in DB or old code. I will keep it but map it to lifetime.
        default: return AccountType.unknown;
    }
}
