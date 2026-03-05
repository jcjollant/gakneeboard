import dotenv from 'dotenv'
import { TemplateDao } from '../backend/TemplateDao'
import { PageType } from '../backend/TemplateTools'
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });
process.env.POSTGRES_URL = process.env.POSTGRES_PROD_URL;
console.log('Using PRODUCTION database');


TemplateDao.getAllTemplateData().then(templates => {
    const dico = {}
    for (let template of templates) {
        for (let page of template.data) {
            if (page.type == PageType.tiles) {
                try {
                    for (let tile of page.data) {
                        // build a string of tile name > tile mode
                        const str = tile.name + ' > ' + tile.data?.mode
                        // console.log(str)
                        if (dico[str]) {
                            dico[str]++
                        } else {
                            dico[str] = 1;
                        }
                    }
                } catch (err) {
                    console.log('[could not list tiles', template.id, page.name, page.data)
                }
            }
        }
    }
    console.log(dico)
})

