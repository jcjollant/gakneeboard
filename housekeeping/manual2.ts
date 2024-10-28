import { Dao } from "../backend/dao/Dao";
// import { Metrics } from "../backend/Metrics";
import { postgresUrl } from "../test/constants"

process.env.POSTGRES_URL=postgresUrl


// Metrics.sessions().then(metric => {
//     console.log(metric.name, metric.value)
// })

new Dao('prints').count().then( r => console.log(r))
