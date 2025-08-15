import { TileType } from "./TileType";

export class TileData {
    name: string
    data: Object
    span2: boolean
    hide: boolean

    constructor(name:string,data:Object|undefined = undefined, expanded:boolean=false) {
        this.name = name
        this.data = data ?? {}
        this.span2 = expanded
        this.hide = false
    }

    static copy(data:any):TileData {
        const tile = new TileData(data.name, data.data)
        tile.span2 = data.span2 || false
        tile.hide = data.hide || false
        return tile
    }

    static parse(text:string):TileData {
        const data = JSON.parse(text)
        if(!('name' in data)) throw new Error('Tile name missing')
        return new TileData(data.name, data.data)
    }

    static sameAirportAndRunway(tile1:TileData, tile2:TileData):boolean {
        if(!tile1 || !tile2) return false;
        if(tile1.name != TileType.airport || tile2.name != TileType.airport) return false;

        // do airport codes match?
        if(tile1.data['code'] != tile2.data['code'] || !tile1.data['code'] || !tile2.data['code']) return false;
        if(tile1.data['rwy'] != tile2.data['rwy']) return false;

        return true;
    }

    static sameTypeAndMode(tile1:TileData, tile2:TileData, type:string, mode:string):boolean {
        console.log('[TileData.sameTypeAndMode]', tile1, tile2)
        if(!tile1 || !tile2) return false;
        if(tile1.name != type || tile2.name != type) return false;
        if( ('mode' in tile1.data && tile1.data?.mode != mode) || ('mode' in tile2.data && tile2.data?.mode != mode)) return false;

        console.log('[TileData.sameTypeAndMode] true for', tile1, tile2)
        return true;
    }
}
