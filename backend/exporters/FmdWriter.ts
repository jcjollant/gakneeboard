import { Template } from "../models/Template"
import { FmdChecklist } from "./FmdChecklist"

export class FmdWriter {
    // public static async encodeTemplate(template:Template):Promise<ArrayBuffer> {
    //     const checklist:FmdChecklist = FmdChecklist.fromTemplate(template)
    //     return FmdWriter.encode(checklist)
    // }

    // public static async encode(checklist:FmdChecklist):Promise<ArrayBuffer> {
    //     {
    //         type: 'checklist',
    //         payload: {
    //             objectId: uuidV4().replaceAll('-', ''),
    //             schemaVersion: '1.0',
    //             metadata: {
    //                 name: file.metadata?.name,
    //                 detail: file.metadata?.makeAndModel,
    //                 tailNumber: file.metadata?.aircraftInfo.toUpperCase(),
    //             }:ForeFlightChecklistMetadata 
    //             // Normal / Abnormal / Emergency
    //             // groups > subgroups > 
    //             groups: [
    //                 objectId: uuidV4().replaceAll('-', ''),
    //                 groupType: ChecklistGroup_Category.normal,
    //                 items: [
    //                     objectId: uuidV4().replaceAll('-', ''),
    //                     title: checklistTitle,
    //                     items: [{
    //                         objectId: uuidV4().replaceAll('-',''),
    //                         type: 'comment', // 
    //                         title: challenge,
    //                         detail: response    
    //                     }

    //                     ]:ForeFlightChecklistItem[]
    //                 ]:ForeFlightChecklistSubgroup[]
    //             ]:ForeFlightChecklistGroup[]
    //         }:ForeFlightChecklistPayload
    //     }:ForeFlightChecklistContainer

    //     const ab:ArrayBuffer = new ArrayBuffer(1)
    //     return ab
    // }
}