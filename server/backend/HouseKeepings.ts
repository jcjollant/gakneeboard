import { Metric } from "./Metrics"

export class HouseKeeping {
    public static async performAdipCleanup(): Promise<Metric> {
        return new Promise((resolve, reject) => {
            resolve(new Metric('Adip Clean Up', 0))
        })
    }
}