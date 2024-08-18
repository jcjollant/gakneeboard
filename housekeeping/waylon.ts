import { postgresUrl } from '../test/constants'
import { Metric, Metrics } from '../backend/Metrics'

process.env.POSTGRES_URL=postgresUrl

console.log('Hello Sir');


(async () => {
    const allMetrics:Metric[] = await Metrics.perform();
    console.log('Right Sir!', JSON.stringify( allMetrics));
})();

