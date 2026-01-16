import { describe, expect, test} from '@jest/globals';
import { Crc32 } from '../backend/Crc32';

function match4Bytes(a:Uint8Array,b:Uint8Array) {
    expect(a[0]).toBe(b[0])
    expect(a[1]).toBe(b[1])
    expect(a[2]).toBe(b[2])
    expect(a[3]).toBe(b[3])
}

describe( 'CRC32', () => {


    test('few values', async () => {
        const t1 = Buffer.from('This is a test')
        const v1 = Uint8Array.from([0xcd, 0x60, 0x85, 0x3f])
        const r1:Uint8Array = Crc32.computeArray(t1)
        match4Bytes(r1, v1)

        const t2 = Buffer.from('abcde')
        const v2 = 2240272485
        expect(Crc32.compute(t2)).toBe(v2)

        const t3 = Buffer.from([0x00, 0x73, 0x75, 0x70, 0x20, 0x62, 0x72, 0x6f, 0x00])
        expect(Crc32.compute(t3)).toBe(2488970058)
        const v3 = Uint8Array.from([0xb5, 0x54, 0xa5, 0x6b])
        const r3:Uint8Array = Crc32.computeArray(t3)
        match4Bytes(r3, v3)
    })
})