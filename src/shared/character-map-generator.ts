/**
 * CharacterMapGenerator - Shared
 *
 * Generates a mapping of single character strings to different values / objects
 */
export class CharacterMapGenerator<T> {
    
    private readonly map: { [char: string]: T } = {};

    /**
     * CharacterMapGenerator constructor
     *
     * @param  compareFunction Function used to compare known existing items to new items
     */
    public constructor(private readonly compareFunction: (existingItem: T, newItem: T) => boolean = (e, n) => e == n) {
        
    }

    /**
     * Exports map of characters to items
     *
     * @returns  Dictionary mapping single character strings to items
     */
    public exportMap(): { [char: string]: T } {
        return this.map;
    }
    
    /**
     * Generates a new single character string which is not within the character map
     *
     * @returns  New single character string
     */
    public generateCharacter(): string {
        let char: string;
        let index = 0;
        do {
            char = String.fromCharCode(index);
            index += 1;
        } while (this.map[char] !== undefined);
        return char;
    }

    /**
     * Gets the assigned character for an item
     *
     * @param    item Item to retrieve assigned character for
     * @returns       Character assigned to represent item
     */
    public getCharacter(item: T): string {

        // If character for item exists
        for (const [char, mapItem] of Object.entries(this.map)) {
            if (this.compareFunction(mapItem, item))
                return char;
        }

        // Otherwise, generate new character
        const newChar = this.generateCharacter();
        this.map[newChar] = item;
        return newChar;
    }

    /**
     * Gets a string representing a list of items
     *
     * @param    items List of items to generate string for
     * @returns        String representing list of items
     */
    public getString(items: T[]): string {
        let result = '';
        for (const item of items)
            result += this.getCharacter(item);
        return result;
    }
}
