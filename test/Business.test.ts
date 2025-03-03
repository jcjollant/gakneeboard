
import { describe, expect, test } from '@jest/globals'
import { AccountType } from '../backend/models/AccountType';
import { Business } from '../backend/business/Business';
import { it } from 'node:test';

describe('Business', () => {
    test ('maxPagesFromAccountType', () => {
        const expectedValues = [
            {type:AccountType.beta, pages: 5}, 
            {type:AccountType.simmer, pages: 0}, 
            {type:AccountType.unknown, pages: 0}, 
        ]
        for(const value of expectedValues) {
               expect(Business.maxPagesFromAccountType(value.type)).toBe(value.pages)
        }
    })

});

