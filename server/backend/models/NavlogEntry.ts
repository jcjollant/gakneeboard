export class NavlogEntry {
    name: string;
    alt: number|undefined; // Altitude
    att: string|undefined; // attitude
    tc: number|undefined; // True Course
    wind: string|undefined; // Wind
    tas: number|undefined; // True Airspeed
    th: number|undefined; // True Heading
    mh: number|undefined; // Magnetic Heading
    ch: number|undefined; // Compass Heading
    ld: number|undefined; // leg distance
    gs: number|undefined; // ground speed
    lt: number|undefined; // let time
    fr: number|undefined; // fuel remaining
    lf: number|undefined; // leg fuel
    mv: number|undefined; // magnetic variation
    md: number|undefined; // magnetic deviation
    mc: number|undefined; // magnetic course

    constructor(name:string,altitude:number|undefined,trueCourse:number|undefined,distance:number|undefined) {
        this.name = name;
        this.alt = altitude;
        this.tc = trueCourse;
        this.ld = distance;
    }
}