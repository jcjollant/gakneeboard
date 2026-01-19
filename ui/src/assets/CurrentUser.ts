import axios, { AxiosResponse } from "axios";
import { duplicate } from "./data";
import { LocalStoreService } from "../services/LocalStoreService";
import { User } from "../models/User";
import { AccountType } from '@checklist/shared';
import { Template } from "../models/Template";

import { LibraryChecklist } from "../models/LibraryChecklist";

export class CurrentUser {
  loggedIn: boolean
  sha256: string;
  name: string;
  pageCount: number;
  templates: Template[];
  checklists: LibraryChecklist[];
  maxPageCount: number;
  maxTemplateCount: number;
  listeners: { (user: CurrentUser): void }[];
  accountType: AccountType;
  printCredits: number;
  eulaCurrent: boolean;

  static noUser() { return new CurrentUser() }

  constructor() {
    // console.log('[CurrentUser.constructor] constructor called')
    this.loggedIn = false;
    this.sha256 = "";
    this.name = "";
    this.templates = [];
    this.checklists = [];
    this.pageCount = 0;
    this.maxPageCount = 0;
    this.maxTemplateCount = 0;
    this.accountType = AccountType.unknown
    this.printCredits = 0;
    this.eulaCurrent = false;

    this.listeners = [];
  }

  addListener(listener: any) {
    // console.log('[CurrentUser.addListener] Adding listener', listener)
    this.listeners.push(listener)
    // console.log('[CurrentUser.addListener] added a listener', this.listeners.length)
  }

  /**
  * Add user information to request header if user is known
  * @param {*} url 
  * @returns 
  */
  async getUrl(url: string): Promise<AxiosResponse<any, any>> {
    // console.log('[data.getUrlWithUser]', JSON.stringify(currentUser))
    if (this.loggedIn) {
      return axios.get(url, { headers: { 'user': this.sha256 } })
    } else {
      return axios.get(url)
    }
  }


  login(data: any) {
    // console.log('[CurrentUser.login] logging in')
    this.loggedIn = true;
    this.update(data)
    localStorage.setItem(LocalStoreService.user, JSON.stringify(data))
  }

  logout() {
    // console.log('[CurrentUser.logout]')
    this.loggedIn = false;
    this.sha256 = "";
    this.name = "";
    this.templates = [];
    localStorage.removeItem(LocalStoreService.user)
    this.notify()
  }

  notify() {
    // console.log('[CurrentUser.update] notifying listeners', this.listeners.length, this.templates.length)
    for (const listener of this.listeners) {
      listener(this)
    }
  }

  removeListener(listener: any) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
      // console.log('[CurrentUser.removeListener] removed a listener', this.listeners.length)
    }
  }

  removeTemplate(id: number) {
    // console.log('[CurrentUser.removeTemplate]', id, this.templates.length)
    // no need to resort, just remove the entry
    this.templates = this.templates.filter((t) => t.id != id);
    // console.log('[CurrentUser.removeTemplate]', this.templates.length)
    this.notify()
  }

  removeChecklist(id: string) {
    this.checklists = this.checklists.filter((c) => c.id != id);
    this.notify()
  }

  addChecklist(checklist: LibraryChecklist) {
    // remove existing if any
    this.removeChecklist(checklist.id)
    this.checklists.push(checklist)
    this.notify()
  }

  restore() {
    // attempt to restore user from localstore
    const lsUser: User | undefined = LocalStoreService.getUser()

    if (lsUser) {
      this.login(lsUser)
    }
  }

  sortTemplates() {
    if (this.templates && this.templates.length > 1) {
      this.templates.sort((a, b) => {
        if (a.name) return a.name.localeCompare(b.name)
        return 0
      });
    }
  }

  update(data: any) {
    // console.log('[CurrentUser.update] updating', data)
    if (data) {
      this.sha256 = data.sha256;
      this.name = data.name;
      this.accountType = data.accountType;

      this.templates = data.templates ? data.templates.map(Template.parse) : [];
      this.checklists = data.checklists ? data.checklists.map((c: any) => new LibraryChecklist(c.id, c.fullName, c.shortName, c.entries)) : [];
      this.sortTemplates()
      this.pageCount = this.templates.reduce((a, t) => a + t.pages, 0)
      this.maxPageCount = Number(data.maxPages || 0);
      this.maxTemplateCount = Number(data.maxTemp || 0);
      this.printCredits = Number(data.printCredits || 0)
      this.eulaCurrent = data.eulaCurrent || false

      // save new user data
      localStorage.setItem(LocalStoreService.user, JSON.stringify(data))

      // notify listeners
      this.notify()
    }
  }

  // A template has been updated. Reflect the new data
  updateTemplate(updatedTemplate: Template) {
    // console.log('[data.customSheetSave] sheet saved', JSON.stringify(responseSheet))
    // update that sheet in currentUser.sheets if it exists
    let index = -1
    if (updatedTemplate.id != 0 && this.templates.length > 0) {
      index = this.templates.findIndex(t => t.id == updatedTemplate.id)
    }

    // we don't need the data
    const templateNoData = duplicate(updatedTemplate)
    templateNoData.data = []

    // add new template or or update existing sheet
    if (index == -1) {
      this.templates.push(templateNoData)
    } else {
      // update existing entry
      this.templates[index] = templateNoData;
    }

    // update page count
    this.pageCount = this.templates.reduce((a, t) => a + t.pages, 0)


    this.sortTemplates()
    this.notify()
  }
  updateThumbnail(id: number, url: string, hash: string) {
    const template = this.templates.find(t => t.id == id)
    if (template) {
      template.thumbUrl = url
      template.thumbHash = hash
      this.notify()
    }
  }
}