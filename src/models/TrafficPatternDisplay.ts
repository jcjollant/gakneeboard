export enum TrafficPatternDisplay {
    None = 'None',
    Downwind = 'Down',
    Entry45 = '45',
    Midfield = 'Mid'
}

export const TrafficPatternDisplayLabels: Record<TrafficPatternDisplay, string> = {
    [TrafficPatternDisplay.None]: 'None',
    [TrafficPatternDisplay.Downwind]: 'Downwind',
    [TrafficPatternDisplay.Entry45]: '45° Entry',
    [TrafficPatternDisplay.Midfield]: 'Midfield'
};

export const TrafficPatternDisplayValues = Object.values(TrafficPatternDisplay);
