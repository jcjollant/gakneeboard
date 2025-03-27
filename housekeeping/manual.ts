
require('dotenv').config();

//================
// Metrics
//================
import { Metrics } from "../backend/Metrics";
// Metrics.airports().then(metrics => {
//     for(const metric of metrics)
//         console.log(metric.name, metric.value)
// })
// Usage metrics
// Metrics.usage().then(metrics => {
//     for(const metric of metrics)
//         console.log(metric.name, metric.value)
// })
// Metrics.adip().then(metric => {
//     console.log(metric.name, metric.value)
// })
// Users Metrics
Metrics.users().then( output => {
    console.log(output)
    console.log(JSON.stringify(output))
})
// Template Details
// Metrics.templateDetails().then(metrics => {
//     for(const metric of metrics)
//         console.log(metric.name, metric.value)
// })



//============
// Users Check
// import { HealthCheck } from "../backend/HealthChecks";
// HealthCheck.usersCheck() .then( check => {
//     console.log(check.name, check.status, check.msg)
// })

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


//===============================================================================
// Update all airports that do not have a sketch, with version 15 and are current
// import { sql } from "@vercel/postgres";
// import { AirportSketch } from "../backend/AirportSketch";
// import { AirportDao } from "../backend/AirportDao";
// import { Airport } from "../backend/models/Airport";
// import { Adip } from "../backend/adip/Adip";
// declare and execute
// async function doIt() {
//     const response = await sql`SELECT * FROM airports where sketch isnull and version=15`
//     console.log('found rows', response.rowCount)
//     await new Promise(resolve => setTimeout(resolve, 2000))
//     for(const row of response.rows) {
//         const airport = AirportDao.parse(row)
//         airport.code = row.code
//         console.log('Getting', airport.code)
//         if(airport.effectiveDate != Adip.currentEffectiveDate) {
//             console.log('skipping', airport.code)
//             continue;
//         }
//         await AirportSketch.get(airport)

//         // wait random time between 1 and 5 seconds
//         const time = Math.floor(Math.random() * 4000) + 1000
//         console.log('Waiting', time, 'ms')
//         await new Promise(resolve => setTimeout(resolve, time))
//     }
// }
// doIt().then(() => {
//     console.log('done')
// })
