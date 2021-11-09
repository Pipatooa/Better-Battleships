import type { IPlayerInfo } from '../../../../shared/network/scenario/i-player-info';
import type { Client } from '../../sockets/client';
import type { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { getJSONFromEntry, UnpackingError } from '../unpacker';
import { getAttributes } from './attributes/attribute-getter';
import type { AttributeMap } from './attributes/i-attribute-holder';
import type { IAttributeHolder } from './attributes/sources/attribute-holder';
import { Ship } from './ship';
import type { IPlayerSource } from './sources/player';
import { playerSchema } from './sources/player';
import type { IShipSource } from './sources/ship';

/**
 * Player - Server Version
 *
 * Contains game information for a single player
 */
export class Player implements IAttributeHolder {
    public client: Client | undefined;

    /**
     * Player constructor
     *
     * @param  spawnRegion    Region that the player should first be allowed to place ships in
     * @param  color          Color for the player
     * @param  highlightColor Color for the player when highlighted
     * @param  ships          List of ships that belong to the player
     * @param  attributes     Attributes for the player
     */
    public constructor(public readonly spawnRegion: string,
                       public readonly color: string,
                       public readonly highlightColor: string,
                       public readonly ships: Ship[],
                       public readonly attributes: AttributeMap) {
    }

    /**
     * Factory function to generate Player from JSON scenario data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    playerSource   JSON data for Player
     * @param    spawnRegion    Region that the player should first be allowed to place ships in
     * @param    color          Color for player
     * @param    highlightColor Color for player when highlighted
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created Player object
     */
    public static async fromSource(parsingContext: ParsingContext, playerSource: IPlayerSource, spawnRegion: string, color: string, highlightColor: string, checkSchema: boolean): Promise<Player> {

        // Validate JSON data against schema
        if (checkSchema)
            playerSource = await checkAgainstSchema(playerSource, playerSchema, parsingContext);

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), playerSource.attributes, 'player');
        parsingContext = parsingContext.withPlayerAttributes(attributes);

        // Get ships
        const ships: Ship[] = [];
        for (const shipName of playerSource.ships) {

            // If ship does not exist
            if (!(shipName in parsingContext.shipEntries))
                throw new UnpackingError(`Could not find 'ships/${shipName}.json'`, parsingContext);

            // Unpack ship data
            const shipSource: IShipSource = await getJSONFromEntry(parsingContext.shipEntries[shipName]) as unknown as IShipSource;
            ships.push(await Ship.fromSource(parsingContext.withUpdatedFile(`ships/${shipName}.json`), shipSource, true));
        }

        // Return created Player object
        return new Player(spawnRegion, color, highlightColor, ships, attributes);
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created IPlayerInfo object
     */
    public makeTransportable(): IPlayerInfo {
        return {
            ships: this.ships.map(s => s.makeTransportable()),
            spawnRegion: this.spawnRegion
        };
    }
}
