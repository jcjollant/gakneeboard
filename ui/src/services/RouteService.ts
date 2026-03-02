import { Route } from "@gak/shared";

export class RouteService {
    static getAirportCode(route: Route | undefined, segment: string): string | undefined {
        if (!route) return undefined
        // Segment must be one of 'dep', 'dst' or 'alt'
        if (segment == '#dep') return route.dep
        if (segment == '#dst') return route.dst
        if (segment == '#alt') return route.alt
        return undefined
    }

    static getSegment(route: Route | undefined, codeFromRoute: string): "dep" | "dst" | "alt" | undefined {
        if (!route) return undefined
        if (route.dep == codeFromRoute) return "dep"
        if (route.dst == codeFromRoute) return "dst"
        if (route.alt == codeFromRoute) return "alt"
        return undefined
    }
}