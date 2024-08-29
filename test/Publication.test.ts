
import {describe, expect, test} from '@jest/globals';

import { Publication } from '../backend/models/Publication'

describe('Publication', () => {
    test ('constructor', () => {
        // pick a random number between 1 and 1000
        const someId = Math.trunc(Math.random() * 1000)
        const someCode = 'GA'
        const someSheetId = Math.trunc(Math.random() * 1000)
        const pub:Publication = new Publication(someId, someCode, someSheetId)
        expect(pub.id).toBe(someId) 
        expect(pub.code).toBe(someCode) 
        expect(pub.templateId).toBe(someSheetId)
    })

})
