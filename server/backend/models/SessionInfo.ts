import { UserView } from "./UserView";

export interface SessionInfo {
    version: string
    camv: number
    aced: number
    user?: UserView

}
