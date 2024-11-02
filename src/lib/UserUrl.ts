export class UserUrl {
    // Within the GA Kneeboard
    static privacy:string="./privacy.html"
    static eula:string="./eula.html"
    static main:string = 'https://kneeboard.ga'

    // Blog stuff
    static blog:string='https://gakneeboard.wordpress.com/'
    static airportTileGuide:string='https://gakneeboard.wordpress.com/2024/07/28/airport-tile-guide/'
    static atisTileGuide:string='https://gakneeboard.wordpress.com/2024/07/29/atis-tile-guide/'
    static checklistGuide:string = 'https://gakneeboard.wordpress.com/2024/08/06/checklist-syntax-guide/'
    static fuelBugTileGuide:string = 'https://gakneeboard.wordpress.com/2024/07/30/fuel-bug-tile-guide/'
    static printGuide:string = 'https://gakneeboard.wordpress.com/print-guide/'
    static radioFlowTileGuide:string = 'https://gakneeboard.wordpress.com/2024/08/03/radio-flow-tile-guide/'
    static sunlightTileGuide:string = 'https://gakneeboard.wordpress.com/2024/08/10/sunlight-tile-guide/'

    // Youtube
    static navlogVideo:string = 'https://www.youtube.com/playlist?list=PLS4A2hmRgOclcjE4THa034Lgq0THbewUX'
    static airportTileVideo:string='https://youtu.be/MmahnI5fiS4'
    static editorVideo:string = 'https://youtu.be/ftQ8nRyvXCs'

    // other external link
    static dtpp:string = 'https://aeronav.faa.gov/d-tpp/'
    static facebookGroup:string = 'https://www.facebook.com/groups/1479675382917767'
    static garminAce:string = 'https://www8.garmin.com/support/download_details.jsp?id=5075'
    static patreon:string = 'https://patreon.com/GAKneeboard'

    static open(url:string) {
        window.open( url, '_blank');
    }
}