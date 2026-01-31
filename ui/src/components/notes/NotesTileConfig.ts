import { DisplayModeNotes } from '../../models/DisplayMode';

export class NotesTileConfig {
    mode: DisplayModeNotes;
    word: string;
    comp: boolean;

    constructor(
        mode: DisplayModeNotes = DisplayModeNotes.Blank,
        word: string = 'CRAFT',
        comp: boolean = true
    ) {
        this.mode = mode;
        this.word = word;
        this.comp = comp;
    }
}
