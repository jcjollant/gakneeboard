import { VerticalInfoBarContent } from "../../models/VerticalInfoBarOption";

export class PrintOptions {
    flipBackPage: boolean;

    pageSelection: boolean[]
    vibShow: boolean;
    vibItems: VerticalInfoBarContent[];
    clipMargin: number;
    backToBack: boolean;

    constructor(flipBackPage: boolean, pageSelection: boolean[], vibShow: boolean, vibItems: VerticalInfoBarContent[], clipMargin: number = 0, backToBack: boolean = false) {
        this.flipBackPage = flipBackPage;
        this.pageSelection = pageSelection;
        this.vibShow = vibShow;
        this.vibItems = vibItems;
        this.clipMargin = clipMargin;
        this.backToBack = backToBack
    }
}