export class PrintOptions {
    flipBackPage:boolean;
    pagePerSheet:number;
    pageSelection:boolean[]
    showSidebar:boolean;

    constructor(flipBackPage:boolean, pagePerSheet:number, pageSelection:boolean[], showSidebar:boolean) {
        this.flipBackPage = flipBackPage;
        this.pagePerSheet = pagePerSheet;
        this.pageSelection = pageSelection;
        this.showSidebar = showSidebar;
    }
}