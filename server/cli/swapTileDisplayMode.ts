import dotenv from 'dotenv';
import path from 'path';
import { sql } from "@vercel/postgres";
import { TemplateDao } from '../backend/TemplateDao';
import { TemplateHistoryDao, TemplateOperation } from '../backend/dao/TemplateHistoryDao';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}
dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });

const args = process.argv.slice(2);
const useProd = args.includes('prod');

if (useProd) {
    process.env.POSTGRES_URL = process.env.POSTGRES_PROD_URL;
    console.log('Using PRODUCTION database');
} else {
    console.log('Using DEFAULT database');
}

// Variables for swapping
let sourceType = 'sunlight';
let sourceMode = null;
let targetType = 'vfr';
let targetMode = 'sunlight';

async function main() {
    if (useProd) {
        const answer = await question('Are you sure you want to proceed against the PRODUCTION database? (y/N): ');
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            console.log('Aborting.');
            rl.close();
            process.exit(0);
        }
    }

    console.log(`Scanning templates for tile type: "${sourceType}", mode: "${sourceMode}"`);
    console.log(`Target will be tile type: "${targetType}", mode: "${targetMode}"`);

    const templates = await TemplateDao.getAllTemplates();
    const updatesPending: { template: any, parsedData: any, newData: any }[] = [];

    for (let template of templates) {
        if (!template.data) continue;

        let needsUpdate = false;

        let parsedData;
        if (typeof template.data === 'string') {
            try {
                parsedData = JSON.parse(template.data);
            } catch (err) {
                console.error(`Could not parse data for template ${template.id}`);
                continue;
            }
        } else {
            parsedData = template.data;
        }

        const newData = JSON.parse(JSON.stringify(parsedData));

        for (let page of newData) {
            if (page.type === 'tiles' && page.data && Array.isArray(page.data)) {
                for (let tile of page.data) {
                    const currentMode = tile.data?.mode;
                    const matchesMode = (currentMode === sourceMode) || (!currentMode && !sourceMode);

                    if (tile.name === sourceType && matchesMode) {
                        tile.name = targetType;
                        if (!tile.data) tile.data = {};
                        tile.data.mode = targetMode;
                        needsUpdate = true;
                    }
                }
            }
        }

        if (needsUpdate) {
            updatesPending.push({ template, parsedData, newData });
        }
    }

    if (updatesPending.length === 0) {
        console.log('\nFinished! No templates found that require updating.');
        rl.close();
        return;
    }

    console.log(`\nFound ${updatesPending.length} template(s) that require updating.`);
    const updateAnswer = await question(`Do you want to apply these updates? (y/N): `);
    if (updateAnswer.toLowerCase() !== 'y' && updateAnswer.toLowerCase() !== 'yes') {
        console.log('Aborting update.');
        rl.close();
        process.exit(0);
    }
    rl.close();

    console.log('\nProcessing updates...');
    let updatedCount = 0;

    for (const { template, parsedData, newData } of updatesPending) {
        console.log(`Updating template ID: ${template.id} (Version: ${template.version})`);

        try {
            await sql`
                INSERT INTO template_history (
                    template_id, user_id, data, name, version, description, pages, thumbnail, thumbhash, operation
                ) VALUES (
                    ${template.id}, ${template.userId}, ${JSON.stringify(parsedData)}, ${template.name}, 
                    ${template.version}, ${template.description}, ${template.pages}, ${template.thumbnail}, 
                    ${template.thumbhash}, ${TemplateOperation.UPDATE}
                )
            `;

            const newVersion = template.version + 1;
            await sql`UPDATE sheets SET data=${JSON.stringify(newData)}, version=${newVersion} WHERE id=${template.id}`;
            updatedCount++;
        } catch (err) {
            console.error(`Error updating template ID ${template.id}:`, err);
            console.error('Stopping further processing.');
            process.exit(1);
        }
    }

    console.log(`\nFinished! Successfully updated ${updatedCount} templates.`);
}

main().catch(err => {
    console.error('Error swapping tile display mode:', err);
    process.exit(1);
});
