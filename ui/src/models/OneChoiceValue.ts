export class OneChoiceValue {
    label: string
    value: any
    active: boolean
    title: string|undefined
    constructor(label:string, value:any, title:string|undefined=undefined, active: boolean = true) {
        this.label = label
        this.value = value
        this.title = title
        this.active = active
    }
}