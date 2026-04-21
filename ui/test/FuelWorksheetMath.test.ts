import { describe, expect, test } from '@jest/globals';
import { FuelWorksheetMath } from '../src/services/FuelWorksheetMath';
import { FuelWorksheetData } from '../src/models/FuelWorksheetTypes';

function makeWorksheetData(overrides: Partial<FuelWorksheetData> = {}): FuelWorksheetData {
    return {
        aircraftTailNumber: 'N12345',
        hangarItems: [],
        aircraftItems: [],
        flightRules: 'VFR',
        vfrTime: 'Day',
        ifrAlternateMinutes: 0,
        personalBufferMinutes: 0,
        taxiFuelGallons: 0,
        fuelGallons: 0,
        legs: [],
        ...overrides,
    };
}

describe('FuelWorksheetMath', () => {
    describe('computePayloadWeight', () => {
        test('returns 0 when no items are assigned', () => {
            const data = makeWorksheetData({ aircraftItems: [] });
            expect(FuelWorksheetMath.computePayloadWeight(data)).toBe(0);
        });

        test('sums weight of a single item', () => {
            const data = makeWorksheetData({
                aircraftItems: [
                    { id: '1', name: 'Pilot', weightLbs: 180, isPerson: true, stationIndex: 0 },
                ],
            });
            expect(FuelWorksheetMath.computePayloadWeight(data)).toBe(180);
        });

        test('sums weights of multiple items', () => {
            const data = makeWorksheetData({
                aircraftItems: [
                    { id: '1', name: 'Pilot', weightLbs: 180, isPerson: true, stationIndex: 0 },
                    { id: '2', name: 'Copilot', weightLbs: 170, isPerson: true, stationIndex: 1 },
                    { id: '3', name: 'Luggage', weightLbs: 30, isPerson: false, stationIndex: 2 },
                ],
            });
            expect(FuelWorksheetMath.computePayloadWeight(data)).toBe(380);
        });

        test('handles items with zero weight', () => {
            const data = makeWorksheetData({
                aircraftItems: [
                    { id: '1', name: 'Empty bag', weightLbs: 0, isPerson: false, stationIndex: 0 },
                    { id: '2', name: 'Pilot', weightLbs: 200, isPerson: true, stationIndex: 1 },
                ],
            });
            expect(FuelWorksheetMath.computePayloadWeight(data)).toBe(200);
        });

        test('handles fractional weights', () => {
            const data = makeWorksheetData({
                aircraftItems: [
                    { id: '1', name: 'Item A', weightLbs: 10.5, isPerson: false, stationIndex: 0 },
                    { id: '2', name: 'Item B', weightLbs: 20.3, isPerson: false, stationIndex: 1 },
                ],
            });
            expect(FuelWorksheetMath.computePayloadWeight(data)).toBeCloseTo(30.8);
        });
    });
});
