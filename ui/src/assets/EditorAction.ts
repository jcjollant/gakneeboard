export class EditorAction {
    static _add2Pages: string = 'ad2';
    static _changeOffset: string = 'cho';
    static COPY_PAGE_TO_CLIPBOARD: string = 'cpc';
    static COPY_TILE_TO_CLIPBOARD: string = 'ctc';
    static DELETE_PAGE: string = 'd1p';
    static DUPLICATE_PAGE: string = 'dup';
    static _delete2Pages: string = 'd2p';
    static INSERT_PAGE: string = 'i1p';
    static PASTE_PAGE: string = 'pp';
    static PASTE_TILE: string = 'pt';
    static RESET_PAGE: string = 'rp';
    static SWAP_PAGE: string = 'sp';
    static SWAP_TILES: string = 'st';
    static TOGGLE_CAPTURE: string = 'tc';

    action: string;
    offset: number;
    offsetTo: number;
    params: any | undefined;

    constructor(action: string, offset: number = 0, offsetTo: number = 0, params: any = undefined) {
        this.action = action;
        this.offset = offset;
        this.offsetTo = offsetTo;
        this.params = params;
    }

    static add2Pages(): EditorAction {
        return new EditorAction(EditorAction._add2Pages);
    }

    static changeOffset(offset: number): EditorAction {
        return new EditorAction(EditorAction._changeOffset, offset);
    }

    static copyPageToClipboard(offset: number): EditorAction {
        return new EditorAction(EditorAction.COPY_PAGE_TO_CLIPBOARD, offset);
    }

    static copyTileToClipboard(offset: number, tile: number): EditorAction {
        return new EditorAction(EditorAction.COPY_TILE_TO_CLIPBOARD, offset, tile);
    }

    static deletePage(offset: number): EditorAction {
        return new EditorAction(EditorAction.DELETE_PAGE, offset);
    }

    static delete2Pages(offset: number): EditorAction {
        return new EditorAction(EditorAction._delete2Pages, offset);
    }

    static duplicatePage(offsetFrom: number, offsetTo: number): EditorAction {
        return new EditorAction(EditorAction.DUPLICATE_PAGE, offsetFrom, offsetTo);
    }

    static insertPage(offset: number): EditorAction {
        return new EditorAction(EditorAction.INSERT_PAGE, offset);
    }

    static pastePage(offset: number): EditorAction {
        return new EditorAction(EditorAction.PASTE_PAGE, offset);
    }

    static pasteTile(offset: number, tile: number): EditorAction {
        return new EditorAction(EditorAction.PASTE_TILE, offset, tile);
    }

    static reset(offset: number): EditorAction {
        return new EditorAction(EditorAction.RESET_PAGE, offset);
    }
    static swapPage(offsetFrom: number, offsetTo: number): EditorAction {
        return new EditorAction(EditorAction.SWAP_PAGE, offsetFrom, offsetTo);
    }
    static swapTiles(offset: number, params: any): EditorAction {
        return new EditorAction(EditorAction.SWAP_TILES, offset, offset, params);
    }

    static toggleCapture(): EditorAction {
        return new EditorAction(EditorAction.TOGGLE_CAPTURE);
    }

}