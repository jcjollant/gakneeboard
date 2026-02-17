import { PublicationDao } from '../PublicationDao'
import { TemplateDao } from '../TemplateDao'
import { TicketService } from './TicketService'
import { TemplateKneeboardView } from '../models/TemplateKneeboardView'
import { PublishedTemplate } from '../models/PublishedTemplate'
import { Publication } from '../models/Publication'
import { Template } from '../models/Template'

export class PublicationService {

    public static async get(code: string): Promise<TemplateKneeboardView | undefined> {
        const pub: Publication | undefined = await PublicationDao.findByCode(code)
        if (!pub || !pub.templateId) {
            await TicketService.create(3, "Publication not found with code " + code)
            return undefined
        }
        const template: Template | undefined = await TemplateDao.readByIdStatic(pub.templateId, 0, true)
        if (!template) {
            await TicketService.create(2, `Template ${pub.templateId} not found for publication ${code}`)
            return undefined
        }

        const view = TemplateKneeboardView.parseTemplate(template, pub)
        // Force the id to 0 because the requester is most likely not the creator and we don't want to expose the source template id
        view.id = 0
        return view
    }

    // Get a list of published templates
    public static async getList(): Promise<PublishedTemplate[]> {
        const pubs: PublishedTemplate[] = await PublicationDao.list()
        return pubs
    }
}
