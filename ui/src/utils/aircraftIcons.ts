export interface AircraftIcon {
    id: string;
    label: string;
    type: 'image' | 'font-awesome';
    path?: string;
    faIcon?: string;
}

export const AIRCRAFT_ICONS: AircraftIcon[] = [
    { id: 'default', label: 'Default', type: 'font-awesome', faIcon: 'fa-plane' },
    { id: 'bonanza', label: 'Bonanza', type: 'image', path: '/aircrafts/bonanza.png' },
    { id: 'cessna-hw', label: 'Cessna (High Wing)', type: 'image', path: '/aircrafts/cessna-hw.png' },
    { id: 'cirrus', label: 'Cirrus', type: 'image', path: '/aircrafts/cirrus.png' },
    { id: 'da40', label: 'Diamond DA40', type: 'image', path: '/aircrafts/da40.png' },
    { id: 'da42', label: 'Diamond DA42', type: 'image', path: '/aircrafts/da42.png' },
    { id: 'pa28', label: 'Piper PA28', type: 'image', path: '/aircrafts/pa28.png' },
    { id: 'sling-lw', label: 'Sling (Low Wing)', type: 'image', path: '/aircrafts/sling-lw.png' },
    { id: 'sling-4-hw', label: 'Sling 4 HW', type: 'image', path: '/aircrafts/sling-4-hw.png' },
];

export function getIcon(iconId: string | undefined): AircraftIcon {
    if (!iconId) return AIRCRAFT_ICONS[0];
    const icon = AIRCRAFT_ICONS.find(i => i.id === iconId || i.path === iconId || i.faIcon === iconId);
    return icon || AIRCRAFT_ICONS[0];
}
