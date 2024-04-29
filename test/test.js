import { adipJfk } from './testData.js'
import { fetch, fromAdip } from '../api/adip.js'

// const adip = fromAdip(adipJfk)
const adip = await fetch('dfw')
console.log(JSON.stringify(adip))
