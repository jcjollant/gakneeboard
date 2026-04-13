import { DisplayModeChoice, DisplayModeRadios } from '../../models/DisplayMode';

export class RadioTileConfig {
    static modesList: DisplayModeChoice[] = [
        new DisplayModeChoice('Selected Frequencies', DisplayModeRadios.FreqList, true, 'Custom list of frequencies', '/tiles/radio-frequencies.png', 'S'),
        new DisplayModeChoice('Route Frequencies', DisplayModeRadios.RouteFrequencies, true, 'Route frequencies', '/tiles/radio-frequencies.png', 'R'),
        new DisplayModeChoice('Service Volumes', DisplayModeRadios.ServiceVolumes, false, 'Service Volumes', '/tiles/radio-sv.png', 'V'),
    ];
}
