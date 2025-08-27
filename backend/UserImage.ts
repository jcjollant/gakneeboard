import axios from "axios";
import { put } from "@vercel/blob"
import { User } from "./models/User";
import { GApiError } from "./GApiError";

export class UserImage {
    static async getBlobUrl(userId: number, imageUrl: any):Promise<string> {
        let output:string = ''
        // fetch the image using axios and upload in the blob
        await axios.get(imageUrl, { responseType: 'arraybuffer' })
            .then(async (response) => {
                // console.debug('[UserImage.getBlobUrl]', userId, '->', imageUrl)
                const buffer = Buffer.from(response.data, 'binary');
                // console.debug('[UserImage.getBlobUrl] size', buffer.length)
 
                const hash = User.createSha256(imageUrl)

                const blob = await put(`userimg/${userId}-${hash}`, buffer, {
                    access: "public",
                    contentType: "image/png",
                    token: process.env.BLOB_READ_WRITE_TOKEN,
                })

                output = blob.url
            })
            .catch(error => {
                console.error(error);
                throw new GApiError(500, error)
            });
        return output
    }
}