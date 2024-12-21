import { duplicate } from "./data";
import { LocalStore } from "../lib/LocalStore";
import { User } from "../model/User";

export class CurrentUser {
    loggedIn:boolean
    sha256:string;
    name:string;
    templates:any[]
    maxTemplateCount:number;
    listeners:{(user: CurrentUser):void}[];


    constructor() {
      // console.log('[CurrentUser.constructor] constructor called')
      this.loggedIn = false;
      this.sha256 = "";
      this.name = "";
      this.templates = [];
      this.maxTemplateCount = 0;
      this.listeners = [];
    }

    addListener(listener:any) {
      // console.log('[CurrentUser.addListener] Adding listener', listener)
      this.listeners.push(listener)
      // console.log('[CurrentUser.addListener] added a listener', this.listeners.length)
    }

    login(data:any) {
      // console.log('[CurrentUser.login] logging in')
      this.loggedIn = true;
      this.update(data)
      localStorage.setItem(LocalStore.user, JSON.stringify(data))
    }

    logout() {
      // console.log('[CurrentUser.logout]')
      this.loggedIn = false;
      this.sha256 = "";
      this.name = "";
      this.templates = [];
      localStorage.removeItem(LocalStore.user)
      this.notify()
    }

    notify() {
      // console.log('[CurrentUser.update] notifying listeners', this.listeners.length)
      for(const listener of this.listeners) {
        listener(this)
      }
    }

    removeListener(listener:any) {
      const index = this.listeners.indexOf(listener)
      if(index > -1) {
        this.listeners.splice(index, 1)
        // console.log('[CurrentUser.removeListener] removed a listener', this.listeners.length)
      }
    }

    removeTemplate(id:number) {
      // no need to resort, just remove the entry
      this.templates = this.templates.filter((t) => t.id !== id);
      this.notify()
    }

    restore() {
      // attempt to restore user from localstore
      const lsUser:User|undefined = LocalStore.getUser()

      if( lsUser) {
        this.login(lsUser)
      }
    }

    sortTemplates() {
      if(this.templates && this.templates.length > 2) {
        this.templates.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    update( data:any) {
      // console.log('[CurrentUser.update] updating', data)
      if(data) {
          this.sha256 = data.sha256;
          this.name = data.name;
          this.templates = data.templates ? data.templates : [];
          this.sortTemplates()
          this.maxTemplateCount = Number(data.maxTemp ? data.maxTemp : 0);

          // notify listeners
          this.notify()
      }
    }

    updateTemplate(updatedTemplate:any) {
      // console.log('[data.customSheetSave] sheet saved', JSON.stringify(responseSheet))
      // update that sheet in currentUser.sheets if it exists
      let index = -1
      if( updatedTemplate.id != 0 && this.templates.length > 0) {
        index = this.templates.findIndex( t => t.id == updatedTemplate.id)
      }
      // we don't need the data
      const templateNoData = duplicate(updatedTemplate)
      templateNoData.data = []

      // add new template or or update existing sheet
      if( index == -1) {
        this.templates.push(templateNoData)
      } else {
        // update existing entry
        this.templates[index] = templateNoData;
      }
      this.sortTemplates()
    }
}