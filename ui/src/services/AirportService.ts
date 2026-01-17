import { Airport, AirportFrequency } from "../models/Airport";
import { Frequency, FrequencyType } from "../models/Frequency";
import { Formatter } from "../lib/Formatter";

export class AirportService {

    static getFrequency(airport: Airport, name: string): AirportFrequency | undefined {
        return airport.freq.find((freq) => freq.name == name)
    }

    static getFreq(airport: Airport, name: string): number | undefined {
        return this.getFrequency(airport, name)?.mhz
    }

    static getAnyFrequency(airport: Airport, patterns: string[]): AirportFrequency | undefined {
        // test wether freq.name contains any of the patterns
        return airport.freq.find((freq) => (patterns.some(p => freq.name.includes(p))))
    }

    static getFreqClearance(airport: Airport): number | undefined {
        return this.getFreq(airport, 'CD/P')
    }

    static getFreqCtaf(airport: Airport): number | undefined {
        return this.getFreq(airport, 'CTAF');
    }

    static getFreqGround(airport: Airport): Frequency {
        const af = this.getFrequency(airport, 'GND');
        if (af) {
            return Frequency.fromType(af.mhz, FrequencyType.ground)
        }
        const name = Frequency.typeToString(FrequencyType.ground);
        return Frequency.noFreq(name, FrequencyType.ground)
    }

    static getFreqTower(airport: Airport): number | undefined {
        return this.getFreq(airport, 'TWR');
    }

    static getFreqTowerAll(airport: Airport): AirportFrequency[] {
        return airport.freq.filter(f => f.name.includes('TWR'))
    }

    static getFreqTowerIfr(airport: Airport): number | undefined {
        const list = this.getFreqTowerAll(airport)
        if (list.length == 0) return undefined
        // return the first element
        return list.sort((f1, f2) => f2.mhz - f1.mhz)[0].mhz;
    }

    static getFreqWeather(airport: Airport): Frequency | undefined {
        const af = this.getAnyFrequency(airport, ['ATIS', 'ASOS', 'AWOS', 'Weather'])
        return af ? new Frequency(Formatter.frequency(af.mhz), af.name, FrequencyType.weather) : undefined
    }
}
