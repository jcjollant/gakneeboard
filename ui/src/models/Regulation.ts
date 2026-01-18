export class Regulation {
    name: string;
    value: string;
    url: string;
    desc: string;

    constructor(name: string, value: string, url: string, desc: string) {
        this.name = name;
        this.value = value;
        this.url = url;
        this.desc = desc;
    }

    static BasicVFRWeatherMiniums = new Regulation('Basic VFR Weather Requirements', '91.155', 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/subpart-B/section-91.155', 'Basic VFR Weather Requirements');
    static IFRFlightPlanInformation = new Regulation('IFR Flight Plan: Information Required', '91.169', 'https://www.ecfr.gov/current/title-14/part-91/section-91.169', 'IFR Flight Plan: Information Required');
    static IFRTwoWayRadioFailure = new Regulation('IFR operations: Two-way radio communications failure', '91.185', 'https://www.ecfr.gov/current/title-14/part-91/section-91.185', 'IFR operations: Two-way radio communications failure');
    static AircraftLights = new Regulation('Aircraft Lights', '91.209', 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/subpart-C/section-91.209', 'Aircraft Lights');
    static Far1_1 = new Regulation('General Definitions', 'FAR 1.1', 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-A/part-1/section-1.1', 'General Definitions');
    static SupplementalOxygen = new Regulation('Supplemental Oxygen', '91.211', 'https://www.ecfr.gov/current/title-14/part-91/section-91.211', 'Supplemental Oxygen');
    static RecentFlightExperiencePic = new Regulation('Recent Flight Experience PIC', '61.57', 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-A/section-61.57', 'Recent Flight Experience PIC');
    static VfrAltitudes = new Regulation('VFR cruising altitude', '91.159', 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/subpart-B/section-91.159', 'VFR cruising altitude');
    static StandardServiceVolumes = new Regulation('Standard Service Volumes', 'AIM 1-1-8', 'https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap1_section_1.html#$paragraph1-1-8', 'Standard Service Volumes');
    static MinimumSafeAltitudes = new Regulation('Minimum Safe Altitudes', '91.119', 'https://www.ecfr.gov/current/title-14/chapter-I/section-91.119', 'Minimum Safe Altitudes');
}