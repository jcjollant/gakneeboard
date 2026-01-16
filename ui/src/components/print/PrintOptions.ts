import { VerticalInfoBarOption } from "../../models/VerticalInfoBarOption";

export class PrintOptions {
    flipBackPage: boolean;
    pagePerSheet: number;
    pageSelection: boolean[]
    vibOption: VerticalInfoBarOption;
    clipMargin: number;

    constructor(flipBackPage: boolean, pagePerSheet: number, pageSelection: boolean[], vibo: VerticalInfoBarOption, clipMargin: number = 0) {
        this.flipBackPage = flipBackPage;
        this.pagePerSheet = pagePerSheet;
        this.pageSelection = pageSelection;
        this.vibOption = vibo;
        this.clipMargin = clipMargin;
    }
}