import dotenv from 'dotenv'
import { TemplateDao } from '../backend/TemplateDao'
import { PageType } from '../backend/TemplateTools'
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });

process.env.POSTGRES_URL = process.env.POSTGRES_PROD_URL;

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('Please provide a tile type and display mode name as arguments. Example: npx ts-node searchDisplayMode.ts "Radio" "Route Frequencies"');
    process.exit(1);
}

const targetTileType = args[0];
const targetMode = args[1];

TemplateDao.getAllTemplateData().then(templates => {
    let count = 0;
    const templateIds: Set<number> = new Set();

    for (let template of templates) {
        if (!template.data) continue;
        for (let page of template.data) {
            if (page.type == PageType.tiles && page.data) {
                try {
                    for (let tile of page.data) {
                        if (tile.name === targetTileType && tile.data?.mode === targetMode) {
                            count++;
                            templateIds.add(template.id);
                        }
                    }
                } catch (err) {
                    console.log('[could not list tiles', template.id, page.name, page.data)
                }
            }
        }
    }

    console.log(`\nSearch Results for Tile Type: "${targetTileType}", Display Mode: "${targetMode}"`);
    console.log(`Total occurrences: ${count}`);
    console.log(`Unique templates using this mode: ${templateIds.size}`);

    if (templateIds.size > 0) {
        console.log('\nTemplate IDs:');
        for (let id of templateIds) {
            console.log(`- ${id}`);
        }
    }
}).catch(err => {
    console.error('Error fetching templates:', err);
})
