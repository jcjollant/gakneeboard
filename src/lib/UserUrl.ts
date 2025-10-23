export class UserUrl {
    // Within the GA Kneeboard
    static privacy:string="/privacy.html"
    static eula:string="/eula.html"
    static main:string = 'https://kneeboard.ga'

    // Blog stuff
    static blog:string='https://gakneeboard.wordpress.com/'
    static airportTileGuide:string='https://gakneeboard.wordpress.com/airport-tile-guide/'
    static atisTileGuide:string='https://gakneeboard.wordpress.com/2024/07/29/atis-tile-guide/'
    static checklistGuide:string = 'https://gakneeboard.wordpress.com/2024/08/06/checklist-syntax-guide/'
    static fuelBugTileGuide:string = 'https://gakneeboard.wordpress.com/2024/07/30/fuel-bug-tile-guide/'
    static printGuide:string = 'https://gakneeboard.wordpress.com/print-guide/'
    static radioTileGuide:string = 'https://gakneeboard.wordpress.com/radio-tile-guide/'
    static sunlightTileGuide:string = 'https://gakneeboard.wordpress.com/2024/08/10/sunlight-tile-guide/'
    static checklistDigestPage:string = 'https://gakneeboard.wordpress.com/checklists-digest/'

    // Youtube
    static youTubeChannel:string = 'https://www.youtube.com/@GAKneeboard/videos'
    static navlogVideo:string = 'https://www.youtube.com/playlist?list=PLS4A2hmRgOclcjE4THa034Lgq0THbewUX'
    static airportTileVideo:string='https://youtu.be/lt6GeShW-kU'
    static editorVideo:string = 'https://youtu.be/v9C5Eyr_A3E'
    static ffExportVideo:string = 'https://youtu.be/BNRY8u1hNmo'
    static noteTilesVideo:string = 'https://youtu.be/nqgDI-CpFUU'
    static stripPageVideo:string = 'https://youtu.be/So5kDcN-vKc'

    // other external link
    static dtpp:string = 'https://aeronav.faa.gov/d-tpp/'
    static facebookGroup:string = 'https://www.facebook.com/groups/1479675382917767'
    static facebookProfile:string ='https://www.facebook.com/profile.php?id=61566105696113'
    static garminAce:string = 'https://www8.garmin.com/support/download_details.jsp?id=5075'
    static patreon:string = 'https://patreon.com/GAKneeboard'

    // Regulations
    static regAircraftLights:string = 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/subpart-C/section-91.209'
    static regBasicVFRWeatherMin:string = 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/subpart-B/section-91.155'
    static regFar1_1:string = 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-A/part-1/section-1.1'
    static regRecentFlightExperiencePic: string = 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-A/section-61.57'
    static regVfrAltitudes: string = 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/subpart-B/section-91.159'
    static regIFRFlightPlanInfo: string = 'https://www.ecfr.gov/current/title-14/part-91/section-91.169'
    static regIFRTwoWayRadioFailure: string = 'https://www.ecfr.gov/current/title-14/part-91/section-91.185'
    static regSupplementalOxygen: string = 'https://www.ecfr.gov/current/title-14/part-91/section-91.211'
    
    static open(url:string) {
        window.open( url, '_blank');
    }
}