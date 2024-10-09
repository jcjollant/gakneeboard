export class EditorAction {
    static _add2Pages:string = 'ad2';
    static _changeOffset:string = 'cho';
    static _copyToClipboard:string = 'c2c';
    static _copyToPage:string = 'c2p';
    static _delete2Pages:string = 'd2p';
    static _pastePage:string = 'pp';
    static _resetPage:string = 'rp';
    static _swapPages:string = 'sp';
    static _swapTiles:string = 'st';

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
        return new EditorAction(EditorAction._copyToClipboard, offset);
    }

    static copyToPage(offsetFrom:number,offsetTo:number):EditorAction {
        return new EditorAction(EditorAction._copyToPage, offsetFrom, offsetTo);
    }

    static delete2Pages(offset:number):EditorAction {
        return new EditorAction(EditorAction._delete2Pages, offset);
    }

    static paste(offset:number):EditorAction {
        return new EditorAction(EditorAction._pastePage, offset);
    }

    static reset(offset:number):EditorAction {
        return new EditorAction(EditorAction._resetPage, offset);
    }
    static swapTiles(offset:number, params:any):EditorAction {
        return new EditorAction(EditorAction._swapTiles, offset, offset, params);
    }

}