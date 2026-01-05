import { currentUser } from "../assets/data";
import { Checklist, ChecklistItem, ChecklistItemType, ChecklistTheme } from "../models/Checklist";
import { ChecklistTile } from "../models/ChecklistTile";
import { LibraryChecklist } from "../models/LibraryChecklist";
import axios from "axios";
import { GApiUrl } from "../lib/GApiUrl";
import { Toaster } from "../assets/Toaster";

export class ChecklistService {

    static parseEditor(value: string): Checklist {
        const checklist = new Checklist();
        if (value == '') {
            checklist.items = []
            return checklist
        }

        checklist.items = value.split('\n').map(line => {
            let challenge: string;
            let response: string;
            [challenge, response] = line.split('##')

            // blank line
            if ((!response || !response.length) && (!challenge || !challenge.length)) { // there is no separator
                if (line == '##') return ChecklistItem.alternate()
                return ChecklistItem.blank()
            }
            // No challenge
            if (challenge.length == 0) {
                // it can be a section or a blank line
                // [##]
                if (response.length == 0) return new ChecklistItem()
                // it's a section header
                // Test if it's emergent
                if (response.length > 1) {
                    // emergency and strong background
                    if (response[0] == '!') return ChecklistItem.section(response.substring(1), ChecklistItemType.emergent)
                    if (response[0] == '*') return ChecklistItem.section(response.substring(1), ChecklistItemType.strong)
                }
                // section [##Section]
                return ChecklistItem.section(response)
            }

            if (challenge[0] == '!') {
                return new ChecklistItem(challenge.substring(1), response, '', ChecklistItemType.emergent)
            }
            // normal entry
            return new ChecklistItem(challenge, response)
        })
        return checklist;
    }

    static parseItems(source: any): ChecklistItem[] | undefined {
        if (!source) return undefined
        return source.map((item: any) => {
            return new ChecklistItem(item.c, item.r, item.s, ChecklistService.parseItemType(item.t))
        })
    }

    static parseItemType(source: string): ChecklistItemType {
        switch (source) {
            case 'alt': return ChecklistItemType.alternate
            case 'emer': return ChecklistItemType.emergent
            case 'strong': return ChecklistItemType.strong
            case 'blank': return ChecklistItemType.blank
            default: return ChecklistItemType.undefined
        }
    }

    static parseTile(source: any): ChecklistTile {
        if (!source) return new ChecklistTile()
        const name = source.name ?? 'Checklist'
        const items = ChecklistService.parseItems(source.items)
        const theme = source.theme ?? ChecklistTheme.blue
        return new ChecklistTile(name, items, theme)
    }

    static toEditor(checklist: Checklist): string {
        // Empty list => Empty text
        if (!checklist.items.length) return ''

        // translate items into text
        const list = checklist.items.map(item => {
            if (item.type == ChecklistItemType.blank) return ''
            if (item.type == ChecklistItemType.alternate) return '##'
            if (item.section.length > 0) {
                if (item.type == ChecklistItemType.emergent) return '##!' + item.section;
                if (item.type == ChecklistItemType.strong) return '##*' + item.section;
                return '##' + item.section;
            }
            const challenge = item.type == ChecklistItemType.emergent ? '!' + item.challenge : item.challenge
            if (item.response.length > 0) return challenge + '##' + item.response
            return challenge
        })
        return list.join('\n')
    }

    static toParams(checklist: Checklist): any {
        return checklist.items.map(item => {
            const output: any = {}
            if (item.challenge != '') output['c'] = item.challenge
            if (item.response != '') output['r'] = item.response
            if (item.section != '') output['s'] = item.section
            if (item.type != ChecklistItemType.undefined) output['t'] = item.type
            return output
        })
    }

    static clone(checklist: Checklist): Checklist {
        const newChecklist = new Checklist()
        // Deep copy items
        newChecklist.items = checklist.items.map(item => new ChecklistItem(item.challenge, item.response, item.section, item.type))
        return newChecklist
    }

    static async save(checklist: LibraryChecklist, toaster: Toaster) {
        toaster.info('Saving', 'Saving checklist...')
        const url = GApiUrl.checklist(checklist.id || undefined)
        // If it's a new checklist, it might not have an ID yet, so we POST to root or if updating we PUT/POST to ID?
        // Usually POST to /checklist for new, POST/PUT to /checklist/:id for update.
        // Let's assume generic Save handling:
        // If ID exists, we might want to include it in URL or body.
        // Based on implementation plan: POST to /checklist or checklist/:id

        const headers = { headers: { 'user': currentUser.sha256 } }

        try {
            const response = await axios.post(url, checklist, headers)
            if (response.data) {
                const savedChecklist = new LibraryChecklist(
                    response.data.id,
                    response.data.fullName,
                    response.data.shortName,
                    response.data.entries
                )
                currentUser.addChecklist(savedChecklist)
                toaster.success('Saved', `Checklist "${savedChecklist.fullName}" saved.`)
            }
        } catch (e) {
            console.error(e)
            toaster.error('Error', 'Failed to save checklist.')
        }
    }

    static async delete(checklist: LibraryChecklist, toaster: Toaster) {
        if (!checklist.id) return;
        toaster.info('Deleting', 'Deleting checklist...')
        const url = GApiUrl.checklist(checklist.id)
        const headers = { headers: { 'user': currentUser.sha256 } }

        try {
            await axios.delete(url, headers)
            currentUser.removeChecklist(checklist.id)
            toaster.success('Deleted', `Checklist "${checklist.fullName}" deleted.`)
        } catch (e) {
            console.error(e)
            toaster.error('Error', 'Failed to delete checklist.')
        }
    }

}
