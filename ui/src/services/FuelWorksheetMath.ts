import { FuelWorksheetData } from '../models/FuelWorksheetTypes'
import { Aircraft } from '@gak/shared'

export interface EnvelopeBounds {
    minArm: number
    maxArm: number
    minW: number
    maxW: number
}

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

    /**
     * Compute the bounding box of the CG envelope in a single pass over the
     * combined forward and aft CG limit arrays.
     * @param aircraft The aircraft definition containing fwdCgLimits and aftCgLimits
     * @returns Min/max arm (posInch) and min/max weight across all limits,
     *          or all-zero bounds when no limits are defined
     */
    static computeEnvelopeBounds(aircraft: Aircraft): EnvelopeBounds {
        const limits = [...aircraft.data.fwdCgLimits, ...aircraft.data.aftCgLimits]
        if (limits.length === 0) {
            return { minArm: 0, maxArm: 0, minW: 0, maxW: 0 }
        }
        let minArm = Infinity, maxArm = -Infinity, minW = Infinity, maxW = -Infinity
        for (const l of limits) {
            if (l.posInch   < minArm) minArm = l.posInch
            if (l.posInch   > maxArm) maxArm = l.posInch
            if (l.weightLbs < minW)   minW   = l.weightLbs
            if (l.weightLbs > maxW)   maxW   = l.weightLbs
        }
        return { minArm, maxArm, minW, maxW }
    }
}
