
import dotenv from 'dotenv'
dotenv.config()

import { Maintenance } from '../backend/Maintenance';
Maintenance.waylon().then( output => {
    console.log(output)
})

