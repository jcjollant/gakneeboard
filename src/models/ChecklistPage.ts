import { Checklist } from "./Checklist";
import { ChecklistService } from "../services/ChecklistService";

export class ChecklistPage {
    name: string;
    lists: Checklist[]

    constructor(name: string = 'Checklist') {
        this.name = name;
        this.lists = []
    }
    addList(checklist: Checklist) {
        this.lists.push(checklist)
    }
    addListFromParams(params: any) {
        // sanity check
        if (!params) return;
        const newList = ChecklistService.parseParams(params)
        this.lists.push(newList)
    }
    removeAllLists() {
        this.lists = []
    }
}