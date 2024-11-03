import { HouseKeeping } from "../backend/HouseKeepings";
import { Metrics } from "../backend/Metrics";
import { postgresUrl } from "../test/constants"

process.env.POSTGRES_URL=postgresUrl;


// Metrics.prints().then(metric => {
//     console.log(metric.name, metric.value)
// })

Metrics.templateDetails().then(metrics => {
    for(const metric of metrics)
        console.log(metric.name, metric.value)
})

// new Dao('prints').count().then( r => console.log(r))
// Adip.fetchAirport('OG14').then(airport => console.log(JSON.stringify(airport)));
// (async () => {
//     const metric = await HouseKeeping.performAdipCleanup();
//     console.log(metric.name, metric.value)
// })
