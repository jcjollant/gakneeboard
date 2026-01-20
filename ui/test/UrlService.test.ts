import { describe, expect, test } from '@jest/globals';
import { UrlService } from '../src/services/UrlService';

describe('UrlService', () => {
    test('root should not be localhost', () => {
        expect(UrlService.isTest()).toBe(false);
    });
});
