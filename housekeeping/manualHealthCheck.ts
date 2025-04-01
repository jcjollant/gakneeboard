
import dotenv from 'dotenv'
dotenv.config()

//============
// Users Check
import { HealthCheck } from "../backend/HealthChecks";
// HealthCheck.users() .then( check => {
//     console.log(check.name, check.status, check.msg)
// })

//===============
// Airports Check
// HealthCheck.airportChecks().then( checks => {
//     for(const check of checks) {
//         console.log(check.name, check.status, check.msg)
//     }
// })

HealthCheck.effectiveDateCheck().then( check => {
    console.log(check.name, check.status, check.msg)
})

//============
// HealthCheck
// import { HealthCheck, Check } from "../backend/HealthChecks";
// HealthCheck.perform(false).then(checks => {
//     const reset = "\x1b[0m"
//     let color = "\x1b[32m"
//     for(const check of checks) {
//         if(check.status == Check.SUCCESS) {
//             color = "\x1b[32m"
//         } else {
//             color = "\x1b[31m"
//         }
//         console.log(check.name, color+'['+check.status+']'+reset, check.msg)
//     }
// })


// import { Metrics } from "../backend/Metrics";
// Metrics.topAirports()


//====================
// User Categories
// import { Metrics } from "../backend/Metrics";
// Metrics.usersPerAccountCategory().then( metrics => {
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

// import { Maintenance } from "../backend/Maintenance";
// Maintenance.willie(false, false)

// import { Maintenance } from "../backend/Maintenance";
// Maintenance.waylon(false, false)


//================================
// Show a list of current airports
// import { Adip } from "../backend/adip/Adip";
// import { AirportDao } from "../backend/AirportDao";
// AirportDao.readCurrent(Adip.currentEffectiveDate).then(list => console.log(list.map(a => a.code).join(',')))
