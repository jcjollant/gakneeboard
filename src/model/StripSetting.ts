import { StripType } from "./StripType";

export class StripSetting {
    type:StripType
    data:any

    constructor(type:StripType, data:any = {}) {
        this.type = type
        this.data = data
    }
}