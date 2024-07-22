export class Sunlight {
    date:string;
    sunrise:string;
    sunset:string;
    civilTwilight:{am:string,pm:string};
    solarNoon:string;
    goldenHour:string;

    constructor( from:any, to:any|undefined=undefined) {
        if(from && from.results) {
            this.date = from.results.date;
            this.sunrise = from.results.sunrise;
            this.civilTwilight = {am:'',pm:''};
            this.civilTwilight.am = from.results.dawn;
            this.solarNoon = from.results.solar_noon;
            if(to) {
                this.sunset = to.results.sunset;
                this.civilTwilight.pm = to.results.dusk;
                this.goldenHour = to.results.golden_hour;
            } else {
                this.sunset = from.results.sunset;
                this.civilTwilight.pm = from.results.dusk;
                this.goldenHour = from.results.golden_hour;
            }
        } else {
            this.date = '';
            this.sunrise = '';
            this.sunset = '';
            this.civilTwilight = {am:'',pm:''};
            this.solarNoon = '';
            this.goldenHour = '';
        }
    }
}