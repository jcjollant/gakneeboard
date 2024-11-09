import { Template } from "../models/Template";

export class FmdChecklist {
    static fromTemplate(template:Template):FmdChecklist {
        return new FmdChecklist()
    }
}