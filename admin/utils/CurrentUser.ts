import { AccountType, type UserView } from '@gak/shared';
import axios, { type AxiosResponse } from "axios";
import { duplicate } from "./data";
import { UrlService } from "./UrlService";
import { LocalStoreService } from "./services/LocalStoreService";
// import { Template } from "../models/Template";
// import { User } from "../models/User";
// import { LibraryChecklist } from "../models/LibraryChecklist";

export class CurrentUser {
  loggedIn: boolean
  sha256: string;
  name: string;
  accountType: AccountType;

  static noUser() { return new CurrentUser() }

  constructor() {
    this.loggedIn = false;
    this.sha256 = "";
    this.name = "";
    this.accountType = AccountType.unknown
  }

  /*
  addListener(listener: any) {
    // console.log('[CurrentUser.addListener] Adding listener', listener)
    this.listeners.push(listener)
    // console.log('[CurrentUser.addListener] added a listener', this.listeners.length)
  }
  */

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

  async postUrl(url: string, data: any = {}): Promise<AxiosResponse<any, any>> {
    if (this.loggedIn) {
      return axios.post(url, data, { headers: { 'user': this.sha256 } })
    } else {
      return axios.post(url, data)
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
    this.accountType = AccountType.unknown;

    // Clear user data from localStorage
    localStorage.removeItem(LocalStoreService.user);

    this.notify()
  }

  notify() {
    // console.log('[CurrentUser.update] notifying listeners', this.listeners.length, this.templates.length)
    // for (const listener of this.listeners) {
    //   listener(this)
    // }
  }

  restore() {
    // attempt to restore user from localstore
    const lsUser: any = LocalStoreService.getUser()

    if (lsUser) {
      this.login(lsUser)
    }
  }

  update(data: UserView) {
    // console.log('[CurrentUser.update] updating', data)
    if (data) {
      this.sha256 = data.sha256;
      this.name = data.name;
      this.accountType = data.accountType;

      // save new user data
      localStorage.setItem(LocalStoreService.user, JSON.stringify(data))

      // notify listeners
      this.notify()
    }
  }
}