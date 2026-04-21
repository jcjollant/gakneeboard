import { FuelWorksheetData } from '../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'

export class FuelWorksheetMath {
    /**
     * Compute the total payload weight from all items assigned to the aircraft.
     * @param data The fuel worksheet data containing assigned aircraft items
     * @returns Total weight of all assigned items in pounds
     */
    static computePayloadWeight(data: FuelWorksheetData): number {
        return data.aircraftItems.reduce((sum, item) => sum + item.weightLbs, 0)
    }

    /**
     * Compute the total payload moment from all items assigned to the aircraft.
     * @param data The fuel worksheet data containing assigned aircraft items
     * @param aircraft The aircraft definition containing station arms
     * @returns Total moment of all assigned items in inch-pounds
     */
    static computePayloadMoment(data: FuelWorksheetData, aircraft: Aircraft): number {
        return data.aircraftItems.reduce((sum, item) => {
            const station = aircraft.data.stations[item.stationIndex]
            return sum + (item.weightLbs * (station?.posInch || 0))
        }, 0)
    }
}
