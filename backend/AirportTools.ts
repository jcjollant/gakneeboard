import { Airport, Frequency } from "./models/Airport"

export class AirportTools {
    static getFrequency(freq:Frequency[], name: string) {
        return freq.find((freq) => freq.name == name)?.mhz
    }

   public static isValidAirportCode(code:string):boolean {
        return Airport.isValidCode(code)
    }
}