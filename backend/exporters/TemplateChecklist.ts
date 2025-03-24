import { PageType, Tile } from "../models/Template";
import { TemplateView } from "../models/TemplateView";


export class TemplateChecklistItem {
    c:string // challenge
    r:string // response
    s:string // section
    t:string // type
    constructor() {
        this.c = ''
        this.r = ''
        this.s = ''
        this.t = ''
    }
}

export class TemplateChecklistSection {
    name:string
    items:any[]

    constructor(name:string) {
        this.name = name
        this.items = []
    }

    addItem(item:TemplateChecklistItem) {
        this.items.push(item)
    }

    addItems(items:any[]) {
        this.items = this.items.concat(items)
    }
}

export class TemplateChecklist {
    // Structure : List > Section > Item
    name:string
    sections:TemplateChecklistSection[]

    constructor(name:string) {
        this.name = name
        this.sections = []
    }

    addItems(items:TemplateChecklistItem[]) {
        let section:TemplateChecklistSection|undefined;
        for(const item of items) {
            // ignore blank lines
            if( item.t == 'blank') continue;

            if(item.s) {
                section = this.addSection(item.s)
            } else {
                if(!section) {
                    section = this.addSection('Default')
                }
                section.addItem(item)
            }
        }
    }

    /**
     * Create a new section append it to the list
     * @param name New Section name
     * @returns the newly created section
     */
    addSection(name:string):TemplateChecklistSection {
        const newSection = new TemplateChecklistSection(name)
        this.sections.push(newSection)
        return newSection
    }


    // this format unifies all checklists from a template between checklist page and tiles
    static fromTemplate(template:TemplateView):TemplateChecklist[] {
        const output:TemplateChecklist[] = []
        
        const checklists:any[] = []
        // extract all checlists from pages and tiles
        for( const page of template.data) {
            if(page.type == PageType.checklist) {
                checklists.push({name:page.data.name,items:page.data.items})
                if('items2' in page.data) { // two columns list
                    checklists.push({name:page.data.name, items:page.data.items2})
                }   

            } else if(page.type == PageType.tiles) {
                for(const tile of page.data) {
                    if(tile.name == Tile.checklist) {
                        checklists.push({name:tile.data.name, items:tile.data.items})
                    }
                }
            }
        }

        // no checklists found
        if(!checklists.length) return output;

        // transform these checklists
        let currentList:TemplateChecklist|undefined=undefined;

        for(const checklist of checklists) {
            // is this a new list?
            if(currentList && currentList.name == checklist.name) { 
                // continue existing list
                currentList.addItems(checklist.items)
            } else {
                // start new list
                currentList = new TemplateChecklist(checklist.name)
                currentList.addItems(checklist.items)
                output.push(currentList)
            }
        }


        return output;
    }
}