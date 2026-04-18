import { AircraftDao } from '../server/backend/dao/AircraftDao';
import { Aircraft } from '../shared/src/models/Aircraft';

async function test() {
    const dao = new AircraftDao();
    const userId = 1; // Assuming user 1 exists

    console.log('--- Testing AircraftDao ---');

    // 1. Create
    const newAircraft: any = {
        userId,
        tailNumber: 'N12345',
        make: 'Cessna',
        model: '172S',
        data: {
            climbFuel: 15,
            cruiseFuel: 10,
            descentFuel: 8,
            climbTas: 80,
            cruiseTas: 110,
            basicEmptyWeight: 1600,
            basicEmptyCg: 40,
            maxRampWeight: 2558,
            maxTakeoffWeight: 2550,
            maxLandingWeight: 2550,
            stations: [
                { name: 'Pilot', posInch: 37 }
            ],
            fwdCgLimits: [
                { posInch: 35, weightLbs: 1900 }
            ],
            aftCgLimits: [
                { posInch: 47, weightLbs: 2550 }
            ]
        }
    };

    try {
        const saved = await dao.save(newAircraft);
        console.log('Created:', saved.tailNumber, 'ID:', saved.id);

        // 2. List
        const list = await dao.listForUser(userId);
        console.log('List count:', list.length);

        // 3. Get by tail number
        const fetched = await dao.getByTailNumber(userId, 'N12345');
        console.log('Fetched tail number:', fetched?.tailNumber);

        // 4. Update
        fetched!.data.cruiseFuel = 12;
        const updated = await dao.save(fetched as any);
        console.log('Updated cruise fuel:', updated.data.cruiseFuel);

        // 5. Delete
        const deleted = await dao.deleteAircraft(userId, updated.id);
        console.log('Deleted:', deleted);

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        dao.end();
    }
}

test();
