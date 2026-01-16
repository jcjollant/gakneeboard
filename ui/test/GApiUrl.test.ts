import { describe, expect, test } from '@jest/globals';
import { GApiUrl } from '../src/lib/GApiUrl';

describe('GApiUrl', () => {
    test('root should not be localhost', () => {
        expect(GApiUrl.root.indexOf('localhost')).toBe(-1);
    });
});
