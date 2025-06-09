import dotenv from 'dotenv'
import { TemplateView } from '../backend/models/TemplateView'
import { TemplateDao } from '../backend/TemplateDao'
import { PageType } from '../backend/TemplateTools'

dotenv.config()


TemplateDao.getAllTemplateData().then( templates => {
    const dico = {}
    for(let template of templates) {
        for(let page of template.data) {
            if(page.type == PageType.tiles) {
                try {
                    for(let tile of page.data) {
                        // build a string of tile name > tile mode
                        const str = tile.name + ' > ' + tile.data?.mode
                        // console.log(str)
                        if(dico[str]) {
                            dico[str]++
                        } else {
                            dico[str] = 1;
                        }
                    }
                } catch(err) {
                    console.log('[could not list tiles', template.id, page.name, page.data)
                }
            }
        }
    }
    console.log(dico)
})

