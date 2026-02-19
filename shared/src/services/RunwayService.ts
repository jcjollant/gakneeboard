export class RunwayService {
    public static isValidEndNames(end1: string, end2: string): boolean {
        // Support cardinal directions
        const cardinalDirections = ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'];
        if (cardinalDirections.includes(end1) || cardinalDirections.includes(end2)) {
            if (end1 == 'N' && end2 != 'S') return false;
            if (end1 == 'S' && end2 != 'N') return false;
            if (end1 == 'E' && end2 != 'W') return false;
            if (end1 == 'W' && end2 != 'E') return false;
            if (end1 == 'NE' && end2 != 'SW') return false;
            if (end1 == 'NW' && end2 != 'SE') return false;
            if (end1 == 'SE' && end2 != 'NW') return false;
            if (end1 == 'SW' && end2 != 'NE') return false;
            return true;
        }

        // catch too short and too long runway names 
        if (end1.length < 2 || end1.length > 3) return false
        if (end2.length < 2 || end2.length > 3) return false
        // both ends must have the same length even if it's 3
        if (end1.length != end2.length) return false

        if (end1.length == 3) {
            const position1: string = end1.charAt(2)
            const position2: string = end2.charAt(2)
            // position must be L, R or C
            if (position1 == 'L') {
                if (position2 != 'R') return false;
            } else if (position1 == 'R') {
                if (position2 != 'L') return false
            } else if (position1 == 'C') {
                if (position2 != 'C') return false
            } else {
                // Should be L, R or C
                return false
            }
        }

        // validate runway number
        const number1: number = parseInt(end1.substring(0, 2))
        const number2: number = parseInt(end2.substring(0, 2))

        if (isNaN(number1) || number1 < 1 || number1 > 36) return false
        if (isNaN(number2) || number2 < 1 || number2 > 36) return false
        if (Math.abs(number1 - number2) != 18) return false

        return true
    }

    public static isValidName(name: string): boolean {
        const ends: string[] = name.split(/[-/]/)
        // we need exactly 2 runway ends
        if (ends.length != 2) return false
        // both ends must be valid
        if (!RunwayService.isValidEndNames(ends[0], ends[1])) return false
        return true
    }
}
