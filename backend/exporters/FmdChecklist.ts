import { PageType, Template } from "../models/Template";
import { TemplateChecklist, TemplateChecklistItem, TemplateChecklistSection } from "./TemplateChecklist";

// Fmd Hierarchy Checklist : Groups[] > GroupList[] > ItemList[] > Items
// Template Hierachy : Checklists[] > Section[] > Items
// Subgroups have a type (Normal, Abnormal, Emergency)

// Item Structure
/*
    objectId: 
    type: 'comment', // comment
    title: challenge,
    detail: response    
*/
class FmdItem {
    objectId:string;
    // type:string;
    title:string;
    detail:string;

    constructor(title:string,detail:string) {
        this.objectId = FmdChecklist.uuid()
        this.title = title
        this.detail = detail?.toUpperCase()??'?'
        // this.type = ''
    }
}

// List structure
/* 
    objectId: FmdWriter.uuid(),
    title: checklistTitle,
    items: []
 */
class FmdItemList {
    objectId:string;
    title:string
    items:FmdItem[]

    constructor(name:string) {
        this.objectId = FmdChecklist.uuid()
        this.title = name
        this.items = []
    }
}

class FmdGroupList {
    objectId:string;
    title:string
    items:FmdItemList[]

    constructor(name:string) {
        this.objectId = FmdChecklist.uuid()
        this.title = name
        this.items = []
    }
}

/*  Group Structure
    objectId: FmdWriter.uuid(),
    groupType: ChecklistGroup_Category.normal,
    items: []
*/
class FmdGroup {
    objectId:string
    groupType:string;
    items:FmdGroupList[]

    static TYPE_NORMAL:string = 'normal'
    static TYPE_ABNORMAL:string = 'abnormal'
    static TYPE_EMERGENCY:string = 'emergency'

    constructor(type:string) {
        this.objectId = FmdChecklist.uuid()
        this.groupType = type
        this.items = []
    }
}

export class FmdChecklist {
    objectId:string = FmdChecklist.uuid()
    schemaVersion:string = '1.0'
    metadata:any;
    groups:FmdGroup[]

    constructor(name:string, detail:string) {
        this.metadata =
        {
            name: name,
            detail: detail,
            tailNumber: '',
        },
        this.groups = []
    }

    static fromTemplate(template:Template):FmdChecklist {
        const output = new FmdChecklist(template.name, template.desc??'')

        // extract Template Checklists from source template
        const tcList = TemplateChecklist.fromTemplate(template)

        output.groups = [{
            objectId: FmdChecklist.uuid(),
            groupType: FmdGroup.TYPE_NORMAL,
            items: tcList.map(FmdChecklist.mapGroupList)
        },{
            objectId: FmdChecklist.uuid(),
            groupType: FmdGroup.TYPE_ABNORMAL,
            items: []
        },{
            objectId: FmdChecklist.uuid(),
            groupType: FmdGroup.TYPE_EMERGENCY,
            items: []
        }]

        return output;
    }

    static mapItem(item:TemplateChecklistItem):FmdItem {
        const output = new FmdItem( item.c, item.r)
        // output.type = 'comment'
        return output
    }

    /**
     * Create a subgroup from a template checklist section
     * @param section 
     * @returns new subgroup
     */
    static mapGroupList(checklist:TemplateChecklist):FmdGroupList {
        const output = new FmdGroupList(checklist.name)
        output.items = checklist.sections.map(FmdChecklist.mapItemList)
        return output
    }

    static mapItemList(section:TemplateChecklistSection):FmdItemList {
        const output = new FmdItemList(section.name)
        output.items = section.items.map(FmdChecklist.mapItem)
        return output
    }

    // Unique Identifier
    static uuid():string {
        // generate a new uuidv4
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    }
}
