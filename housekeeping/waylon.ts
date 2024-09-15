import { postgresUrl } from '../test/constants'
import { Metric, Metrics } from '../backend/Metrics'

process.env.POSTGRES_URL=postgresUrl

console.log('Hello Sir');


(async () => {
    Metrics.perform().then( dataString => {
        // console.log(JSON.stringify( allMetrics))
        console.log('Right Sir!');
    })
})();

