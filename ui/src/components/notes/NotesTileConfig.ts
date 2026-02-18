import { DisplayModeChoice, DisplayModeNotes } from '../../models/DisplayMode';

export class NotesTileConfig {
    mode: DisplayModeNotes;
    word: string;
    comp: boolean;

    static modesList = [
        new DisplayModeChoice('Blank', DisplayModeNotes.Blank, true, "Well, A blank Tile", '/tiles/notes-blank.png'),
        new DisplayModeChoice('Acronym', DisplayModeNotes.Word, true, "A configurable acronym on the left side", '/tiles/notes-word.png'),
        new DisplayModeChoice('Compass', DisplayModeNotes.Compass, true, "A blank compass with numerical headings", '/tiles/notes-compass.png'),
        new DisplayModeChoice('Grid', DisplayModeNotes.Grid, true, "A blank grid to organize things", '/tiles/notes-grid.png'),
    ]

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
