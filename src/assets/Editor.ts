export class EditorAction {
    static _add2Pages:string = 'add2Pages';
    static _changeOffset:string = 'changeOffset';
    static _copyPage:string = 'copyPage';
    static _delete2Pages:string = 'delete2Pages';
    static _pastePage:string = 'paste';
    static _resetPage:string = 'reset';
    static _swapPages:string = 'swap';

    action:string;
    offset:number;

    constructor(action:string, offset:number=0) {
        this.action = action;
        this.offset = offset;
    }

    static add2Pages():EditorAction {
        return new EditorAction(EditorAction._add2Pages);
    }

    static changeOffset(offset:number):EditorAction {
        return new EditorAction(EditorAction._changeOffset, offset);
    }

    static copy(offset:number):EditorAction {
        return new EditorAction(EditorAction._copyPage, offset);
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