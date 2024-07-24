export class Sunlight {
    dateFrom:string;
    dateTo:string;
    sunrise:string;
    sunset:string;
    civilTwilight:{am:string,pm:string};
    solarNoon:string;
    goldenHour:string;

    constructor( from:any, to:any|undefined=undefined, overnight:boolean=false) {
        const fromResult:any|undefined = from && from.results ? from.results : undefined;
        const toResult:any|undefined = to && to.results ? to.results : undefined;
        const morning:any = ( toResult && overnight ? toResult : fromResult);
        // evening should be "from" when going to the same airport on the same date or when flying overnight
        const evening:any = ( toResult && !overnight ? toResult : fromResult);
        if(fromResult) {
            // date is always
            this.dateFrom = fromResult.date;
            this.dateTo = (toResult ? toResult.date : fromResult.date);
            this.sunrise = morning.sunrise;
            this.civilTwilight = {am:'',pm:''};
            this.civilTwilight.am = morning.dawn;
            this.civilTwilight.pm = evening.dusk;
            this.solarNoon = fromResult.solar_noon;
            this.sunset = evening.sunset;
            this.goldenHour = (toResult ? toResult.golden_hour : fromResult.golden_hour)
        } else {
            // Nothing to share
            this.dateFrom = '';
            this.dateTo = '';
            this.sunrise = '';
            this.sunset = '';
            this.civilTwilight = {am:'',pm:''};
            this.solarNoon = '';
            this.goldenHour = '';
        }
    }
}