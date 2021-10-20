import Joi from 'joi';
import { IPlayerInfo } from '../../../shared/network/scenario/i-player-info';
import { randomHex } from '../../../shared/utility';
import { Client } from '../sockets/client';
import { getAttributes } from './attributes/attribute-getter';
import {
    attributeHolderSchema,
    AttributeMap,
    AttributeMapSource,
    IAttributeHolder
} from './attributes/i-attribute-holder';
import { genericNameSchema } from './common/generic-name';
import { ParsingContext } from './parsing-context';
import { checkAgainstSchema } from './schema-checker';
import { IShipSource, Ship } from './ship';
import { getJSONFromEntry, UnpackingError } from './unpacker';

/**
 * Player - Server Version
 *
 * Contains game information for a single player
 */
export class Player implements IAttributeHolder {
    public client: Client | undefined;
    public readonly color: string;

    /**
     * Player constructor
     *
     * @param  spawnRegion Region that the player should first be allowed to place ships in
     * @param  ships       List of ships that belong to the player
     * @param  attributes  Attributes for the player
     */
    public constructor(public readonly spawnRegion: string,
                       public readonly ships: Ship[],
                       public readonly attributes: AttributeMap) {

        // Generate a random color for the player
        this.color = randomHex();
    }

    /**
     * Factory function to generate Player from JSON scenario data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    spawnRegion    Region that the player should first be allowed to place ships in
     * @param    playerSource   JSON data for Player
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created Player object
     */
    public static async fromSource(parsingContext: ParsingContext, spawnRegion: string, playerSource: IPlayerSource, checkSchema: boolean): Promise<Player> {

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
        return new Player(spawnRegion, ships, attributes);
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
            ships: this.ships.map(s => s.makeTransportable())
        };
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IPlayerSource {
    ships: string[];
    attributes: AttributeMapSource;
}

/**
 * Schema for validating source JSON data
 */
export const playerSchema = Joi.object({
    ships: Joi.array().items(genericNameSchema).min(1).required()
}).concat(attributeHolderSchema);