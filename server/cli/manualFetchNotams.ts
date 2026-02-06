import dotenv from 'dotenv'
dotenv.config()

import { NotamService, NmsResponseFormat, NotamClassification } from '../backend/services/NotamService'

const code = process.argv[2]

const classificationArg = process.argv[3]
const formatArg = process.argv[4]

if (!code) {
    console.log("Usage: npx ts-node housekeeping/manualFetchNotams.ts <CODE> [CLASSIFICATION] [FORMAT]")
    process.exit(1)
}

let classification: NotamClassification | undefined = undefined;
if (classificationArg && classificationArg !== 'ALL') {
    if (Object.values(NotamClassification).includes(classificationArg as NotamClassification)) {
        classification = classificationArg as NotamClassification;
    } else {
        console.warn(`Invalid classification ${classificationArg}, ignoring. Valid values: ${Object.values(NotamClassification).join(', ')}`)
    }
}

let format: NmsResponseFormat = NmsResponseFormat.GEOJSON;
if (formatArg) {
    if (Object.values(NmsResponseFormat).includes(formatArg as NmsResponseFormat)) {
        format = formatArg as NmsResponseFormat;
    } else {
        console.warn(`Invalid format ${formatArg}, default to GEOJSON. Valid values: ${Object.values(NmsResponseFormat).join(', ')}`)
    }
}

(async () => {
    console.log(`Fetching NOTAMs for ${code} (Format: ${format})...`)
    try {
        const response = await NotamService.getNotams({
            nmsResponseFormat: format,
            location: code,
            classification: classification
        })

        // console.log(JSON.stringify(response, null, 2))

        if (response.status === 'Success') {
            const count = response.data.geojson ? response.data.geojson.length : (response.data.aixm ? response.data.aixm.length : 0);
            console.log(`Successfully fetched ${count} NOTAMs.`)

            if (format === NmsResponseFormat.GEOJSON && response.data.geojson) {
                console.log("--- Simplified NOTAMs ---");
                const simplified = response.data.geojson.map((f: any) => NotamService.simplify(f)).filter((n: any) => n !== null);
                console.log(JSON.stringify(simplified, null, 2));

                // Count types
                const types = simplified.map((s: any) => s?.type).filter((t: any) => t);
                const typeCounts = types.reduce((acc: any, t: any) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
                console.log("--- Type Distribution ---");
                console.log(typeCounts);
            }
        } else {
            console.error('API returned status:', response.status)
            if (response.errors) {
                console.error('Errors:', response.errors)
            }
        }

    } catch (e) {
        console.error("Error fetching NOTAMs:", e)
    } finally {
        console.log("Done.")
        process.exit(0)
    }
})()
