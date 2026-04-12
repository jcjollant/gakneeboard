import { DisplayModeChoice, DisplayModeNotes } from '../../models/DisplayMode';

export class NotesTileConfig {
    mode: DisplayModeNotes;
    word: string;
    comp: boolean;
    pills: string[];
    cols: string[];

    static modesList = [
        new DisplayModeChoice('Blank', DisplayModeNotes.Blank, true, "A completely blank Tile", '/tiles/notes-blank.png'),
        new DisplayModeChoice('Watermark', DisplayModeNotes.Watermark, true, "Configurable Watermarks (Banner, Pills, Columns)", '/tiles/notes-watermark.png'),
        new DisplayModeChoice('Compass', DisplayModeNotes.Compass, true, "A Compass with headings", '/tiles/notes-compass.png'),
        new DisplayModeChoice('Hold', DisplayModeNotes.Hold, true, "A Hold patterns compass", '/tiles/notes-hold.png'),
        new DisplayModeChoice('Grid', DisplayModeNotes.Grid, true, "A handy grid", '/tiles/notes-grid.png'),
    ]

    static pillsOptions = [
        { label: 'Clear T/O', value: 'CTO' },
        { label: 'Clear To Land', value: 'CTL' },
        { label: 'Approach', value: 'APCH' },
    ];

    static columnOptions = [
        { label: 'Altitudes', value: 'ALT' },
        { label: 'Headings', value: 'HDG' },
        { label: 'Frequencies', value: 'FREQ' },
    ];

    constructor(
        mode: DisplayModeNotes = DisplayModeNotes.Blank,
        word: string = '',
        comp: boolean = true,
        pills: string[] = [],
        columns: string[] = []
    ) {
        this.mode = mode;
        this.word = word;
        this.comp = comp;
        this.pills = pills;
        this.cols = columns;
    }
}
