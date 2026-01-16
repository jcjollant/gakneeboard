import dotenv from 'dotenv'
import { TemplateDao } from '../backend/TemplateDao'
import { PageType, Tile } from '../backend/models/Template'

dotenv.config()

TemplateDao.getAllTemplates().then(templates => {
    const userCounts: Record<number, number> = {}

    for (const template of templates) {
        const userId = template.userId
        if (!userCounts[userId]) userCounts[userId] = 0

        if (typeof template.data === 'string') {
            try {
                template.data = JSON.parse(template.data)
            } catch (e) {
                console.error(`Failed to parse data for template ${template.id}`, e)
                continue
            }
        }

        // template.data is the array of pages
        if (!Array.isArray(template.data)) continue

        for (const page of template.data) {
            if (page.type === PageType.checklist) {
                userCounts[userId] += page.data.items?.length || 0
                userCounts[userId] += page.data.items2?.length || 0
                userCounts[userId] += page.data.items3?.length || 0
            } else if (page.type === PageType.tiles) {
                if (Array.isArray(page.data)) {
                    for (const tile of page.data) {
                        if (tile.name === Tile.checklist) {
                            userCounts[userId] += tile.data.items?.length || 0
                        }
                    }
                }
            }
        }
    }

    console.log("User ID | Checklist Items")
    console.log("-----------------------")
    // Sort by count descending
    Object.entries(userCounts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([userId, count]) => {
            if (count > 0) console.log(`${userId.padEnd(7)} | ${count}`)
        })
}).catch(err => {
    console.error("Error running script:", err)
    process.exit(1)
})
