
import dotenv from 'dotenv'
dotenv.config()

import { Maintenance } from '../backend/maintenance/Maintenance';

const character = process.argv[2]?.toLowerCase();

if (!character) {
    console.error("Please provide a character name: willie, waylon, drhibbert, or marge");
    process.exit(1);
}

async function summon(name: string) {
    let output: string = '';
    try {
        switch (name) {
            case 'willie':
                console.log("Summoning Willie...");
                output = await Maintenance.willie();
                break;
            case 'waylon':
                console.log("Summoning Waylon...");
                output = await Maintenance.waylon();
                break;
            case 'drhibbert':
            case 'hibbert':
                console.log("Summoning Dr. Hibbert...");
                output = await Maintenance.drHibbert();
                break;
            default:
                console.error(`Unknown character: ${name}`);
                console.error("Available characters: willie, waylon, drhibbert, marge");
                process.exit(1);
        }
        console.log(output);
        process.exit(0);
    } catch (err) {
        console.error("Error invoking character:", err);
        process.exit(1);
    }
}

summon(character);
