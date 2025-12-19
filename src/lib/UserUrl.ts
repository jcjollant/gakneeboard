export class UserUrl {
    // Within the GA Kneeboard
    static privacy: string = "/privacy.html"
    static eula: string = "/eula.html"
    static main: string = 'https://kneeboard.ga'

    // Blog stuff
    static blog: string = 'https://gakneeboard.wordpress.com/'
    static airportTileGuide: string = 'https://gakneeboard.wordpress.com/airport-tile-guide/'
    static atisTileGuide: string = 'https://gakneeboard.wordpress.com/2024/07/29/atis-tile-guide/'
    static checklistGuide: string = 'https://gakneeboard.wordpress.com/2024/08/06/checklist-syntax-guide/'
    static fuelBugTileGuide: string = 'https://gakneeboard.wordpress.com/2024/07/30/fuel-bug-tile-guide/'
    static printGuide: string = 'https://gakneeboard.wordpress.com/print-guide/'
    static radioTileGuide: string = 'https://gakneeboard.wordpress.com/radio-tile-guide/'
    static sunlightTileGuide: string = 'https://gakneeboard.wordpress.com/2024/08/10/sunlight-tile-guide/'
    static checklistDigestPage: string = 'https://gakneeboard.wordpress.com/checklists-digest/'

    // Youtube
    static youTubeChannel: string = 'https://www.youtube.com/@GAKneeboard/videos'
    static navlogVideo: string = 'https://www.youtube.com/playlist?list=PLS4A2hmRgOclcjE4THa034Lgq0THbewUX'
    static airportTileVideo: string = 'https://youtu.be/bfcyHbju9rs'
    static editorVideo: string = 'https://youtu.be/v9C5Eyr_A3E'
    static ffExportVideo: string = 'https://youtu.be/BNRY8u1hNmo'
    static noteTilesVideo: string = 'https://youtu.be/nqgDI-CpFUU'
    static stripPageVideo: string = 'https://youtu.be/So5kDcN-vKc'

    // other external link
    static dtpp: string = 'https://aeronav.faa.gov/d-tpp/'
    static facebookGroup: string = 'https://www.facebook.com/groups/1479675382917767'
    static facebookProfile: string = 'https://www.facebook.com/profile.php?id=61566105696113'
    static garminAce: string = 'https://www8.garmin.com/support/download_details.jsp?id=5075'
    static patreon: string = 'https://patreon.com/GAKneeboard'

    static open(url: string) {
        window.open(url, '_blank');
    }
}