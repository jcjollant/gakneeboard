
import { HealthCheck } from '../backend/HealthChecks'

require('dotenv').config();

console.log('!Argh!');


(async () => {
    await HealthCheck.perform();
    console.log('!Aye!');
})();

