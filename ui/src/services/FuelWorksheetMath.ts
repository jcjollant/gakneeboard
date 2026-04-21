import { FuelWorksheetData } from '../models/FuelWorksheetTypes'

export class FuelWorksheetMath {
    /**
     * Compute the total payload weight from all items assigned to the aircraft.
     * @param data The fuel worksheet data containing assigned aircraft items
     * @returns Total weight of all assigned items in pounds
     */
    static computePayloadWeight(data: FuelWorksheetData): number {
        return data.aircraftItems.reduce((sum, item) => sum + item.weightLbs, 0)
    }
}
