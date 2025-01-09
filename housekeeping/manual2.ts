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
//===================
// import { Metrics } from "../backend/Metrics";
// Metrics.usage().then(metrics => {
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

//=================
// Template Details
//=================
// import { Metrics } from "../backend/Metrics";
// Metrics.templateDetails().then(metrics => {
//     for(const metric of metrics)
//         console.log(metric.name, metric.value)
// })


//====================
// Page count per user
import { Metrics } from "../backend/Metrics";
Metrics.pagePerUser().then( output => {
    console.log(output)
    console.log(JSON.stringify(output))
})

//====================
// Refresh pages count
// import { TemplateDao } from "../backend/TemplateDao";
// const templateIds = [294, 142, 141, 404, 452, 282, 455, 450, 453, 457, 456, 297, 403, 410, 328, 106, 107, 233, 108, 174, 113, 296, 302, 305, 342, 114, 175, 348, 350, 351, 154, 116, 118, 120, 121, 119, 6, 124, 125, 129, 41, 130, 48, 193, 45, 67, 162, 117, 246, 134, 242, 269, 275, 285, 110, 381, 268, 379, 388, 383, 105, 298, 308, 360, 362, 361, 373, 374, 375, 347, 377, 340, 382, 384, 389, 354, 406, 402, 396, 392, 398, 407, 399, 400, 395, 405, 397, 401, 138];
// // refresh every page in templateIds and and wait 500ms
// const refresh = async () => {
//     for(const templateId of templateIds) {
//         TemplateDao.refreshPagesCount(templateId).then( output => {
//             console.log("New Page Count for template", templateId, output)
//         })
//         await new Promise(resolve => setTimeout(resolve, 500));
//     }
// }
// refresh().then(() => console.log("Done"))

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
