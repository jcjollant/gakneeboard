import { DisplayModeChoice, DisplayModeNotes } from '../../models/DisplayMode';

export class NotesTileConfig {
    mode: DisplayModeNotes;
    word: string;
    comp: boolean;

    static modesList = [
        new DisplayModeChoice('Blank', DisplayModeNotes.Blank, true, "A blank Tile or Watermark", '/tiles/notes-blank.png'),
        new DisplayModeChoice('Compass', DisplayModeNotes.Compass, true, "A blank compass with numerical headings", '/tiles/notes-compass.png'),
        new DisplayModeChoice('Grid', DisplayModeNotes.Grid, true, "A blank grid to organize things", '/tiles/notes-grid.png'),
    ]

    constructor(
        mode: DisplayModeNotes = DisplayModeNotes.Blank,
        word: string = '',
        comp: boolean = true
    ) {
        this.mode = mode;
        this.word = word;
        this.comp = comp;
    }
}
