export class Crc32 {
    static compute(data:Uint8Array):number{ 
        var table = new Uint32Array(256);

        for(var i=256; i--;) {
            var tmp = i;

            for(var k=8; k--;){
                tmp = tmp & 1 ? 3988292384 ^ tmp >>> 1 : tmp >>> 1;
            }
            table[i] = tmp;
        }

        var crc = -1; // Begin with all bits set ( 0xffffffff )

        for(var i=0, l=data.length; i<l; i++) {
            crc = crc >>> 8 ^ table[ crc & 255 ^ data[i] ];
        }

        return ~crc >>> 0 
        // return crc
    }

    static computeArray(data:Uint8Array):Uint8Array {
        const crc1 = this.compute(data);
        const crc = ~crc1 >>> 0;
        // console.log(crc)
        const uint8Array = new Uint8Array(4); 
        // Little Endian
        uint8Array[0] = crc & 0xff;
        uint8Array[1] = (crc >> 8) & 0xff;
        uint8Array[2] = (crc >> 16) & 0xff;
        uint8Array[3] = (crc >> 24) & 0xff;
        return uint8Array;
    }
}