export type RouteCode = "dep" | "dst" | "alt"

export interface Route {
    dep?: string;
    dst?: string;
    alt?: string;
}
