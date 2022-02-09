/**
 * Region - Server Version
 *
 * Identifier for a group of tiles on the board
 */
export class Region {
    public spawnRegionIndex: number | undefined;
    public readonly tiles: [number, number][] = [];

    /**
     * Region constructor
     *
     * @param  id Internal ID for region
     */
    public constructor(public readonly id: string) {
        
    }
}
