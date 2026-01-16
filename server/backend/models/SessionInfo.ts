import { UserMiniView } from "./UserMiniView"

export interface SessionInfo {
    version: string
    camv: number
    aced: number
    user?: UserMiniView

}
