/**
 * Constrains a value between two other values
 *
 * @param    value   Value to constrain
 * @param    minimum Minimum value the value constrained should be allowed to take
 * @param    maximum Maximum value the value constrained should be allowed to take
 * @returns          New value which that lies within the minimum and maximum
 */
export function clamp(value: number, minimum: number, maximum: number): number {
    return Math.max(minimum, Math.min(value, maximum));
}

/**
 * Checks, by element, whether or not two arrays contain the same elements
 *
 * @param    arr1               First array to compare
 * @param    arr2               Second array to compare
 * @param    comparisonFunction Function used to compare items between the two arrays 
 * @returns                     Whether ot not two arrays contain same elements
 */
export function arraysEqual<T>(arr1: T[], arr2: T[], comparisonFunction: (a: T, b: T) => boolean = (a: T, b: T) => a === b): boolean {
    if (arr1.length !== arr2.length)
        return false;

    for (let i = 0; i < arr1.length; i++) {
        if (!comparisonFunction(arr1[i], arr2[i]))
            return false;
    }

    return true;
}

/**
 * Returns a client's name from their identity string
 *
 * @param    identity Identity string
 * @returns           Display name to use
 */
export function nameFromIdentity(identity: string): string {
    const match = /.+?:(.+)/.exec(identity);
    return (match as RegExpMatchArray)[1];
}

/**
 * Returns a random color hex code
 *
 * @returns  Randomly generated hex code
 */
export function randomHex(): string {
    return '#' + ('000000' + Math.floor(Math.random() * Math.pow(256, 3)).toString(16)).slice(-6);
}

/**
 * Blends two colors together through linear interpolation
 *
 * @param    color1 Source hex color 1
 * @param    color2 Source hex color 2
 * @param    t      Number between 0 and 1 representing proportion of each color to use
 * @returns         New hex color
 */
export function lerpColors(color1: string, color2: string, t: number): string {
    const decimalColor1 = parseInt(color1.substr(1), 16);
    const r1 = decimalColor1 & 0xFF0000;
    const g1 = decimalColor1 & 0x00FF00;
    const b1 = decimalColor1 & 0x0000FF;

    const decimalColor2 = parseInt(color2.substr(1), 16);
    const r2 = decimalColor2 & 0xFF0000;
    const g2 = decimalColor2 & 0x00FF00;
    const b2 = decimalColor2 & 0x0000FF;

    let r = r1 * (1 - t) + r2 * t;
    let g = g1 * (1 - t) + g2 * t;
    let b = b1 * (1 - t) + b2 * t;

    return `#${(r & 0xFF0000 | g & 0x00FF00 | b & 0x0000FF).toString(16).padStart(6, '0')}`;
}
