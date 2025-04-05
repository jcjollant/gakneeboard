export class OneChoiceValue {
    label: string
    value: any
    title: string|undefined
    constructor(label:string, value:any, title:string|undefined=undefined) {
        this.label = label
        this.value = value
        this.title = title
    }
}