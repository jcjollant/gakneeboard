import axios from "axios"
import { GApiUrl } from "./GApiUrl"
import { LocalStoreService } from "../services/LocalStoreService"

export class DiagramData {
    static async getPdf(pdfFile: string): Promise<string> {
        // do we already have that image in localstore?
        const image = LocalStoreService.getApproachPlate(pdfFile)
        if (image) {
            return (image);
        }

        return new Promise<string>(res => {
            axios.get(GApiUrl.root + 'diagram/' + pdfFile).then(response => {
                // console.log('[Approach.getImage] response length', response.data.length)
                // const apchImage = 'data:image/jpeg;base64,' + response.data;
                const apchImage = response.data;
                res(apchImage);
                LocalStoreService.saveApproachPlate(pdfFile, apchImage)
            })
        })

    }

}