import { AdipDao } from "./adip/AdipDao"
import { Metric } from "./Metrics"

export class HouseKeeping {
    public static async performAdipCleanup():Promise<Metric> {
        return new Promise((resolve, reject) => {
            AdipDao.cleanUpStaleData().then( (count) => resolve(new Metric('Adip Clean Up', count)))
        })
    }
}