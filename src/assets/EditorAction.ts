export class EditorAction {
    static _add2Pages:string = 'ad2';
    static _changeOffset:string = 'cho';
    static COPY_TO_CLIPBOARD:string = 'c2c';
    static COPY_TO_PAGE:string = 'c2p';
    static DELETE_PAGE:string = 'd1p';
    static _delete2Pages:string = 'd2p';
    static INSERT_PAGE:string = 'i1p';
    static PASTE_PAGE:string = 'pp';
    static RESET_PAGE:string = 'rp';
    static SWAP_PAGE:string = 'sp';
    static SWAP_TILES:string = 'st';

    action:string;
    offset:number;
    offsetTo:number;
    params:any|undefined;

    constructor(action:string, offset:number=0, offsetTo:number=0, params:any=undefined) {
        this.action = action;
        this.offset = offset;
        this.offsetTo = offsetTo;
        this.params = params;
    }

    static add2Pages():EditorAction {
        return new EditorAction(EditorAction._add2Pages);
    }

    static changeOffset(offset:number):EditorAction {
        return new EditorAction(EditorAction._changeOffset, offset);
    }

    static copyToClipboard(offset:number):EditorAction {
        return new EditorAction(EditorAction.COPY_TO_CLIPBOARD, offset);
    }

    static copyToPage(offsetFrom:number,offsetTo:number):EditorAction {
        return new EditorAction(EditorAction.COPY_TO_PAGE, offsetFrom, offsetTo);
    }

    static deletePage(offset:number):EditorAction {
        return new EditorAction(EditorAction.DELETE_PAGE, offset);
    }

    static delete2Pages(offset:number):EditorAction {
        return new EditorAction(EditorAction._delete2Pages, offset);
    }

    static insertPage(offset:number):EditorAction {
        return new EditorAction(EditorAction.INSERT_PAGE, offset);
    }

    static paste(offset:number):EditorAction {
        return new EditorAction(EditorAction.PASTE_PAGE, offset);
    }

    static reset(offset:number):EditorAction {
        return new EditorAction(EditorAction.RESET_PAGE, offset);
    }
    static swapTiles(offset:number, params:any):EditorAction {
        return new EditorAction(EditorAction.SWAP_TILES, offset, offset, params);
    }

}