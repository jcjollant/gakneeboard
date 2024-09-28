export class EditorAction {
    static _add2Pages:string = 'add2Pages';
    static _changeOffset:string = 'changeOffset';
    static _copyToClipboard:string = 'copyToClip';
    static _copyToPage:string = 'copyToPage';
    static _delete2Pages:string = 'delete2Pages';
    static _pastePage:string = 'paste';
    static _resetPage:string = 'reset';
    static _swapPages:string = 'swap';

    action:string;
    offset:number;
    offsetTo:number;

    constructor(action:string, offset:number=0, offsetTo:number=0) {
        this.action = action;
        this.offset = offset;
        this.offsetTo = offsetTo;
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

}