import { describe, expect, test } from '@jest/globals';
import { FuelWorksheetMath } from '../src/services/FuelWorksheetMath';
import { FuelWorksheetData } from '../src/models/FuelWorksheetTypes';
import { Aircraft } from '@gak/shared';

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

function makeAircraft(overrides: any = {}): Aircraft {
    return {
        id: 1,
        userId: 1,
        tailNumber: 'N12345',
        data: {
            make: 'Cessna',
            model: '172',
            climbFuel: 15,
            cruiseFuel: 8,
            descentFuel: 6,
            cruiseTas: 110,
            climbTas: 75,
            descentTas: 110,
            basicEmptyCg: 39.5,
            basicEmptyWeight: 1650,
            maxRampWeight: 2400,
            maxTakeoffWeight: 2400,
            maxLandingWeight: 2400,
            maxUsableFuel: 40,
            stations: [
                { name: 'Front Seats', posInch: 37 },
                { name: 'Rear Seats', posInch: 73 },
                { name: 'Baggage', posInch: 95 }
            ],
            fwdCgLimits: [],
            aftCgLimits: [],
            speeds: { vs0: 40, vs1: 48, vfe: 110, va: 105, vno: 129, vne: 163 },
            ...overrides.data
        },
        ...overrides
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

    describe('computePayloadMoment', () => {
        test('returns 0 when no items are assigned', () => {
            const data = makeWorksheetData({ aircraftItems: [] });
            const aircraft = makeAircraft();
            expect(FuelWorksheetMath.computePayloadMoment(data, aircraft)).toBe(0);
        });

        test('calculates moment for a single item', () => {
            const data = makeWorksheetData({
                aircraftItems: [
                    { id: '1', name: 'Pilot', weightLbs: 200, isPerson: true, stationIndex: 0 },
                ],
            });
            const aircraft = makeAircraft(); // station 0 is at 37 inches
            expect(FuelWorksheetMath.computePayloadMoment(data, aircraft)).toBe(200 * 37);
        });

        test('sums moments for multiple items', () => {
            const data = makeWorksheetData({
                aircraftItems: [
                    { id: '1', name: 'Pilot', weightLbs: 200, isPerson: true, stationIndex: 0 }, // 200 * 37 = 7400
                    { id: '2', name: 'Passenger', weightLbs: 150, isPerson: true, stationIndex: 1 }, // 150 * 73 = 10950
                ],
            });
            const aircraft = makeAircraft();
            expect(FuelWorksheetMath.computePayloadMoment(data, aircraft)).toBe(7400 + 10950);
        });

        test('handles missing stations gracefully (0 arm)', () => {
            const data = makeWorksheetData({
                aircraftItems: [
                    { id: '1', name: 'Mystery Item', weightLbs: 100, isPerson: false, stationIndex: 99 },
                ],
            });
            const aircraft = makeAircraft();
            expect(FuelWorksheetMath.computePayloadMoment(data, aircraft)).toBe(0);
        });

        test('handles items with zero weight', () => {
            const data = makeWorksheetData({
                aircraftItems: [
                    { id: '1', name: 'Empty Bag', weightLbs: 0, isPerson: false, stationIndex: 0 },
                    { id: '2', name: 'Pilot', weightLbs: 200, isPerson: true, stationIndex: 0 },
                ],
            });
            const aircraft = makeAircraft();
            expect(FuelWorksheetMath.computePayloadMoment(data, aircraft)).toBe(200 * 37);
        });
    });
});
