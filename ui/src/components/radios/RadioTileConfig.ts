import { DisplayModeChoice, DisplayModeRadios } from '../../models/DisplayMode';

export class RadioTileConfig {
    static modesList: DisplayModeChoice[] = [
        new DisplayModeChoice('Frequencies', DisplayModeRadios.FreqList, true, 'List of Radio frequencies', '/tiles/radio-frequencies.png'),
        new DisplayModeChoice('Lost Comms VFR', DisplayModeRadios.LostComms, false, 'Lost Comms VFR', '/tiles/radio-lostcomm-vfr.png'),
        new DisplayModeChoice('Lost Comms IFR', DisplayModeRadios.LostCommsIFR, false, 'Lost Comms IFR', '/tiles/radio-lostcomm-ifr.png'),
        new DisplayModeChoice('Service Volumes', DisplayModeRadios.ServiceVolumes, false, 'Service Volumes', '/tiles/radio-sv.png'),
    ];
}
