import axios from "axios"
import { UrlService } from "./UrlService"
import { LocalStoreService } from "./LocalStoreService"

export enum ChartType {
    Diagram = 'diagram',
    Supplement = 'supplement'
}

export class DiagramService {
    static async getPdf(pdfFile: string, type: ChartType = ChartType.Diagram): Promise<string> {
        // do we already have that image in localstore?
        const image = LocalStoreService.getApproachPlate(pdfFile)
        if (image) {
            return (image);
        }

        const endpoint = type === ChartType.Supplement ? 'supplement/' : 'diagram/';
        const url = UrlService.root + endpoint + encodeURIComponent(pdfFile)
        console.debug('[DiagramService.getPdf] url', url)
        return new Promise<string>(res => {
            axios.get(url).then(response => {
                // console.log('[Approach.getImage] response length', response.data.length)
                // const apchImage = 'data:image/jpeg;base64,' + response.data;
                const apchImage = response.data;
                res(apchImage);
                LocalStoreService.saveApproachPlate(pdfFile, apchImage)
            })
        })

    }

}
