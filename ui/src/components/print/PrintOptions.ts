import { VerticalInfoBarOption } from "../../models/VerticalInfoBarOption";

export class PrintOptions {
    flipBackPage: boolean;

    pageSelection: boolean[]
    vibOption: VerticalInfoBarOption;
    clipMargin: number;

    constructor(flipBackPage: boolean, pageSelection: boolean[], vibo: VerticalInfoBarOption, clipMargin: number = 0) {
        this.flipBackPage = flipBackPage;
        this.pageSelection = pageSelection;
        this.vibOption = vibo;
        this.clipMargin = clipMargin;
    }
}