import { VerticalInfoBarContent, VerticalInfoBarOption } from "../../models/VerticalInfoBarOption";

export class PrintOptions {
    flipBackPage: boolean;

    pageSelection: boolean[]
    // vibOption: VerticalInfoBarOption;
    vibShow: boolean;
    vibItems: VerticalInfoBarContent[];
    clipMargin: number;

    constructor(flipBackPage: boolean, pageSelection: boolean[], vibShow: boolean, vibItems: VerticalInfoBarContent[], clipMargin: number = 0) {
        this.flipBackPage = flipBackPage;
        this.pageSelection = pageSelection;
        this.vibShow = vibShow;
        this.vibItems = vibItems;
        this.clipMargin = clipMargin;
    }
}