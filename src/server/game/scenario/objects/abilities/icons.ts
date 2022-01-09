import fs                      from 'fs';
import { UnpackingError }      from '../../errors/unpacking-error';
import type { ParsingContext } from '../../parsing-context';

const iconDirectory = './public/icons';
const iconsAvailable = new Set();

/**
 * Finds icons which are available for use in scenarios
 */
export function findAvailableIcons(): void {
    const files = fs.readdirSync(iconDirectory);
    for (const file of files)
        iconsAvailable.add(file.replace(/.svg$/, ''));
}

/**
 * Gets the url for an icon from an icon name
 *
 * @param    parsingContext Context for resolving scenario data
 * @param    iconName       Name of icon
 * @returns                 Url to icon
 */
export function getIconUrlFromSource(parsingContext: ParsingContext, iconName: string): string {
    if (!iconsAvailable.has(iconName))
        throw new UnpackingError(`Could not find icon named '${iconName}' defined at '${parsingContext.currentPath}'. Must be a valid bootstrap icon name. See 'https://icons.getbootstrap.com/'`,
            parsingContext);
    
    return `/icons/${iconName}.svg`;
}
