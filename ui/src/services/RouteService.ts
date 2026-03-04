import { Route, RouteCode } from "@gak/shared";

export class RouteService {
    static getAirportCode(route: Route | undefined, code: RouteCode | undefined): string | undefined {
        // console.debug('[RouteService.getAirportCode] route', route, 'code', code)
        if (!route || !code) return undefined
        // Segment must be one of 'dep', 'dst' or 'alt'
        if (code == 'dep') return route.dep
        if (code == 'dst') return route.dst
        if (code == 'alt') return route.alt
        return undefined
    }

    static getRouteCode(route: Route | undefined, airportCode: string): RouteCode | undefined {
        if (!route) return undefined
        if (route.dep == airportCode) return "dep"
        if (route.dst == airportCode) return "dst"
        if (route.alt == airportCode) return "alt"
        return undefined
    }
}