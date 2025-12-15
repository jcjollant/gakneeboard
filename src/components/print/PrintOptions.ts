import { VerticalInfoBarOption } from "../../models/VerticalInfoBarOption";

export class PrintOptions {
    flipBackPage:boolean;
    pagePerSheet:number;
    pageSelection:boolean[]
    vibOption:VerticalInfoBarOption;

    constructor(flipBackPage:boolean, pagePerSheet:number, pageSelection:boolean[], vibo:VerticalInfoBarOption) {
        this.flipBackPage = flipBackPage;
        this.pagePerSheet = pagePerSheet;
        this.pageSelection = pageSelection;
        this.vibOption = vibo;
    }
}