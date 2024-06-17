
import { postgresUrl } from '../test/constants'
import { HealthCheck } from '../backend/HealthChecks'

process.env.POSTGRES_URL=postgresUrl

console.log('!Argh!');


(async () => {
    await HealthCheck.perform();
    console.log('!Aye!');
})();

