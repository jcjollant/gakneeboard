import { Business } from "./business/Business"
import { UsageDao, UsageType } from "./dao/UsageDao"
import { UserDao } from "./dao/UserDao"
import { GApiError } from "./GApiError"
import { AccountType } from "./models/AccountType"
import { Publication } from "./models/Publication"
import { Template } from "./models/Template"
import { TemplateView } from "./models/TemplateView"
import { ThumbnailData } from "./models/ThumbnailData"
import { PublicationDao } from "./PublicationDao"
import { TemplateDao } from "./TemplateDao"
import { put } from "@vercel/blob"


export class TemplateStatus {
  code:number; // HttpsStatusCode
  template:TemplateView;
  constructor(code:number, template:TemplateView) {
    this.code = code
    this.template = template
  }
}

export class GApiTemplate {

    /**
     * Delete a sheet by id and user id
     * @param templateId 
     * @param userId 
     * @returns 
     */
    public static async delete(templateId:number, userId:number):Promise<string> {
        return new Promise<string>( async (resolve, reject) => {
            const templateDao = TemplateDao.getInstance()
            const template:Template|undefined = await templateDao.readById(templateId, userId)
            // console.log( '[GApiTemplate.delete] ' + sheetId + ' -> ' + output)
            if( template) {
                await templateDao.delete(templateId, userId)
                return resolve( template.name)
            }
            reject( new GApiError(404, 'Template not found'))
        })
    }

    /**
     * Gets a sheet by id and user id
     * @param templateId 
     * @param userId 
     * @returns 
     * @throws 404 if not found
     */
    public static async get(templateId:number,userId:number):Promise<TemplateView|undefined> {
        const template:Template|undefined = await TemplateDao.readByIdStatic(templateId, userId)
        // console.log( '[GApiTemplate.get] ' + sheetId + ' -> ' + output)
        if( !template) return undefined;
        // is this published?
        const pub:Publication|undefined = await PublicationDao.findByTemplate(template.id)
        const templateView:TemplateView = TemplateView.parseTemplate(template, pub)
        
        return templateView;
    }

    public static async getList(userId:number):Promise<TemplateView[]> {
        const templates:TemplateView[] = await TemplateDao.getOverviewListForUser(userId)
        return templates
    }

    /**
     * Save a new template in DB or update it if it's existing
     * Customers cannot save or create new templates if they are already at or above the limit
     * For new templates, we have a two steps lock down, which will happen gradually
     * Step 1) Customer can save existing templates above the limit
     * Step 2) Customers cannot save existing templates until they are above the limit
     * @param userSha256 User reference
     * @param templateView Whatever needs tob e saved
     * @returns A Template status should be 200 if everything goes fine, 202 if user is within tolerance or 402 if user is over limit
     * @throws
     */
    public static async save(userSha256:string, sheet:any):Promise<TemplateStatus> {
        return new Promise( async (resolve, reject) => {
            // Check templateView is valid
            if( !sheet) {
                // console.log('[GApiTemplate.save]', JSON.stringify(sheet))
                return reject( new GApiError(400, 'Invalid template'))
            }
            const templateView:TemplateView = TemplateView.parse(sheet)

            const user = await UserDao.getUserFromHash(userSha256)
            // check user is in good shape
            if( !user) return reject( new GApiError( 400, "Invalid user"));

            // Check limits
            const templateDao = TemplateDao.getInstance()
            const templateCountForUser = await templateDao.countForUser(user.id)
            // console.log('[GApiTemplate.save]', templateCountForUser, user.accountType)

            // Max limit control
            const maxTemplates = Math.max(Business.maxTemplates(user), user.maxTemplates)
            // We don't allow anything if you are above max 
            if(templateCountForUser > maxTemplates) {
                return reject( new GApiError( 402, "Maximum templates exceeded"))
            }
            // We don't allow creation if you are at max
            if(templateView.id == 0 && templateCountForUser == maxTemplates) {
                return reject( new GApiError( 402, "Maximum templates reached"))
            }

            // Block page augmentation over the limit
            const [totalPageCount, previousPageCount] = await templateDao.pageCount(user.id, templateView.id)
            if(templateView.pages >= previousPageCount) { // page augmentation
                if(totalPageCount - previousPageCount + templateView.pages > user.maxPages) {
                    return reject(new GApiError(402, "Maximum pages reached"))
                }

                // Flight Simmers cannot save templates above 2 pages.
                if(user.accountType == AccountType.simmer && templateView.pages > 2) {
                    return reject(new GApiError(402, "Maximum 2 pages per template reached"))
                }
            }

            await Promise.all([
                templateDao.createOrUpdate(templateView, user.id),
                UsageDao.create(UsageType.Save, user.id, templateView.id ? JSON.stringify({id:templateView.id}) : undefined)
            ])

            // Should we check publication?
            if(templateView.publish) {
                // we need to create a new publication
                const newPublication = await PublicationDao.publish(templateView.id)
                // console.log('[GApiTemplate.save] publication', JSON.stringify(newPublication)); 
                if(!newPublication) return reject( new GApiError(500, "Publication failed"));
                templateView.code = newPublication.code;
            } else {
                // we may need to unpublish that template
                await PublicationDao.unpublish(templateView.id)
                templateView.code = undefined;
            }

            // Return OK
            return resolve( new TemplateStatus( 200, templateView));
        })

    }

    /**
     * Captures a new thumbnail for a template
     * @param templateIdParam 
     * @param userId 
     * @param pngBuffer 
     * @param hash 
     * @returns 
     */
    static async updateThumbnail(templateIdParam: number, userId: number, pngBuffer: Buffer, hash:string):Promise<ThumbnailData> {
        // console.log('[GApiTemplate.updateThumbnail] ' + templateIdParam + ' for ' + userId + ' length ' + pngBuffer.length + ' with ' + hash)
        return new Promise<ThumbnailData>( async (resolve, reject) => {
            // console.log('[GApiTemplate.updateThumbnail] ' + templateIdParam + ' for ' + userId)
            const templateDao = new TemplateDao()
            const templateId = Math.abs(templateIdParam)
            const template:Template|undefined = await templateDao.readById(templateId, userId)

            // unknown template for that user Id => 404
            if(!template) return reject(new GApiError(404, 'Template not found'))
            // Sanity check image data
            if(!pngBuffer) return reject(new GApiError(400, 'Invalid image data'))

            // save image data to blob
            try {
                // Always save to blob storage
                const blob = await put(`thumbnails/${templateIdParam}.png`, pngBuffer, {
                    access: "public",
                    contentType: "image/png",
                    token: process.env.BLOB_READ_WRITE_TOKEN,
                })
                
                // Save url with associated template
                template.thumbnail = blob.url
                template.thumbhash = hash
                const output = await templateDao.updateThumbnail(template)
                
                // Also save to database for backward compatibility
                // await ThumbnailDao.save(templateIdParam, pngBuffer, hash)
                
                // console.log("[GApiTemplate.updateThumbnail] uploaded to blob", template.thumbnail);
                
                return resolve(output)
            } catch(error) {
                console.log('[GApiTemplate.updateThumnail] ' + error)
                return reject( new GApiError(500, `Could not update thumbnail ${templateIdParam} for ${userId}`))
            }
        })
    }
}
