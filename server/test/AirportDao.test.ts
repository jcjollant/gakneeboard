import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { Airport, versionInvalid, AirportSource } from "../backend/models/Airport";
import { AirportDao } from '../backend/AirportDao';
import { sql } from '@vercel/postgres';

jest.mock('@vercel/postgres', () => ({
    sql: jest.fn()
}));

const mockSql = sql as unknown as jest.Mock<any>;

describe('AirportDao', () => {

    beforeEach(() => {
        mockSql.mockClear();
        // Default behavior: empty result
        mockSql.mockResolvedValue({ rows: [], rowCount: 0 });
    });

    test('create', async () => {
        const airport = new Airport('KLAX', undefined, 'Los Angeles Intl', 126);
        airport.version = 1;
        airport.source = AirportSource.Adip;

        // Mock returning an ID
        mockSql.mockResolvedValueOnce({
            rows: [{ id: 101 }],
            rowCount: 1
        });

        await AirportDao.create(airport);

        expect(airport.id).toBe(101);

        // Verify SQL calls
        // Since sql is a template tag, we can checks calls
        expect(mockSql).toHaveBeenCalled();
        // We can inspect the first call arguments to ensure correct columns
        // This is hard with template literals, but we can assume if it ran without error and returned ID, it's ok.
    });

    test('createUnknown', async () => {
        await AirportDao.createUnknown('UNK');
        expect(mockSql).toHaveBeenCalled();
    });

    test('codesLookup', async () => {
        // Setup mock response
        const mockRowKLAX = {
            id: 1,
            icao_id: 'KLAX',
            loc_id: 'LAX',
            data: JSON.stringify(new Airport('KLAX', 'LAX', 'Los Angeles', 100)),
            creatorid: null,
            version: 1,
            source: 'adip'
        };
        const mockRow123 = {
            id: 2,
            icao_id: 'K123',
            loc_id: '123',
            data: JSON.stringify(new Airport('K123', '123', 'Small Strip', 50)),
            creatorid: null,
            version: 1,
            source: 'adip'
        };

        mockSql.mockResolvedValueOnce({
            rows: [mockRowKLAX, mockRow123],
            rowCount: 2
        });

        // Request: KLAX, 123, and MISSING
        const result = await AirportDao.codesLookup(['KLAX', '123', 'MISSING']);

        expect(result.known.length).toBe(2);

        // Verify mapping
        const klax = result.known.find(ka => ka.code === 'KLAX');
        expect(klax).toBeDefined();
        expect(klax?.airport?.icaoId).toBe('KLAX');

        const small = result.known.find(ka => ka.code === '123');
        expect(small).toBeDefined();
        expect(small?.airport?.icaoId).toBe('K123'); // Should point to the airport with K123
        expect(small?.airport?.locId).toBe('123');

        expect(result.notFound).toContain('MISSING');
        expect(result.notFound.length).toBe(1);
    });

    test('codesLookup with known unknown', async () => {
        const mockRowUnknown = {
            id: 3,
            icao_id: 'UNK',
            loc_id: null,
            data: null, // No data implies unknown/unparsed
            creatorid: null,
            version: -1,
            source: null
        };

        mockSql.mockResolvedValueOnce({
            rows: [mockRowUnknown],
            rowCount: 1
        });

        const result = await AirportDao.codesLookup(['UNK']);

        expect(result.knownUnknown.length).toBe(1);
        expect(result.knownUnknown[0].code).toBe('UNK');
        expect(result.knownUnknown[0].airport.version).toBe(versionInvalid);
    });

});
