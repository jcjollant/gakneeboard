import { Template as Template } from './Template';
import { User } from './User'

export class UserMiniView {
    sha256: string;
    name: string;
    maxTemp: number;
    templates: Template[];

    constructor(user:User, templates:Template[]) {
        this.sha256 = user.sha256;
        this.name = user.name;
        this.maxTemp = user.maxTemplates;
        this.templates = templates;
    }
}