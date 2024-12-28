import { postgresUrl } from "../test/constants"
process.env.POSTGRES_URL=postgresUrl;

//================
// Airport metrics
// import { Metrics } from "../backend/Metrics";
// Metrics.airports().then(metrics => {
//     for(const metric of metrics)
//         console.log(metric.name, metric.value)
// })

//================================
// Show a list of current airports
// import { Adip } from "../backend/adip/Adip";
// import { AirportDao } from "../backend/AirportDao";
// AirportDao.readCurrent(Adip.currentEffectiveDate).then(list => console.log(list.map(a => a.code).join(',')))

//===================
// Show Usage metrics
// Metrics.usage().then(metrics => {
//     for(const metric of metrics)
//         console.log(metric.name, metric.value)
// })

//========
// Users Check
// import { HealthCheck } from "../backend/HealthChecks";
// HealthCheck.usersCheck() .then( check => {
//     console.log(check.name, check.status, check.msg)
// })

// HealthCheck
import { HealthCheck, Check } from "../backend/HealthChecks";
HealthCheck.perform(false).then(checks => {
    const reset = "\x1b[0m"
    let color = "\x1b[32m"
    for(const check of checks) {
        if(check.status == Check.SUCCESS) {
            color = "\x1b[32m"
        } else {
            color = "\x1b[31m"
        }
        console.log(check.name, color+'['+check.status+']'+reset, check.msg)
    }
})

// Metrics.templateDetails().then(metrics => {
//     for(const metric of metrics)
//         console.log(metric.name, metric.value)
// })

// new Dao('prints').count().then( r => console.log(r))
// Adip.fetchAirport('OG14').then(airport => console.log(JSON.stringify(airport)));
// (async () => {
//     const metric = await HouseKeeping.performAdipCleanup();
//     console.log(metric.name, metric.value)
// })


// load local file source.fmd into ArrayBuffer
// var fs = require('fs');
// fs.readFile('source.fmd', function(err:any, data:any) {
//     if (err) throw err;
//     FmdWriter.decode(data.buffer).then(text => console.log(text))
// });
