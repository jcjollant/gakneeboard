import { Metrics } from '../backend/Metrics'

require('dotenv').config();

console.log('Hello Sir');


(async () => {
    Metrics.perform().then( dataString => {
        // console.log(JSON.stringify( allMetrics))
        console.log('Right Sir!');
    })
})();

