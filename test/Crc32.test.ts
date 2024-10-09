import { describe, expect, test} from '@jest/globals';
import { Crc32 } from '../backend/Crc32';

describe( 'CRC32', () => {

    test('few values', async () => {
        const t1 = Buffer.from('This is a test')
        const v1 = Uint8Array.from([0x32,0x9f,0x7a,0xc0])
        const r1:Uint8Array = Crc32.computeArray(t1)
        for(let index = 0; index < 4; index++) {
            expect(r1[index]).toBe(v1[index])
        }

        const t2 = Buffer.from('abcde')
        const v2 = 2240272485
        expect(Crc32.compute(t2)).toBe(v2)
    })
})