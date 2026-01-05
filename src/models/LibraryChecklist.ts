
export class LibraryChecklist {
    id: string;
    fullName: string;
    shortName: string;
    entries: string[];

    constructor(id: string, fullName: string, shortName: string, entries: string[]) {
        this.id = id;
        this.fullName = fullName;
        this.shortName = shortName;
        this.entries = entries;
    }
}
