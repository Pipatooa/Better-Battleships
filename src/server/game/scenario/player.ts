import Joi from 'joi';
import {Attribute} from './attributes/attribute';
import {
    attributeHolderSchema,
    AttributeMap,
    AttributeMapSource,
    IAttributeHolder
} from './attributes/i-attribute-holder';
import {genericNameSchema} from './common/generic-name';
import {ParsingContext} from './parsing-context';
import {checkAgainstSchema} from './schema-checker';
import {IShipSource, Ship} from './ship';
import {getJSONFromEntry, UnpackingError} from './unpacker';

/**
 * Player - Server Version
 *
 * Contains game information for a single player
 */
export class Player implements IAttributeHolder {
    protected _client: undefined;

    /**
     * Player constructor
     * @param spawnRegion Region that the player should first be allowed to place ships in
     * @param ships List of ships that belong to the player
     * @param attributes Attributes for the player
     */
    public constructor(public readonly spawnRegion: string,
                       public readonly ships: Ship[],
                       public readonly attributes: AttributeMap) {
    }

    /**
     * Factory function to generate Player from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param spawnRegion Region that the player should first be allowed to place ships in
     * @param playerSource JSON data for Player
     * @param checkSchema When true, validates source JSON data against schema
     * @returns player -- Created Player object
     */
    public static async fromSource(parsingContext: ParsingContext, spawnRegion: string, playerSource: IPlayerSource, checkSchema: boolean): Promise<Player> {

        // Validate JSON data against schema
        if (checkSchema)
            playerSource = await checkAgainstSchema(playerSource, playerSchema, parsingContext);

        // Get attributes
        let attributes: AttributeMap = {};
        for (let [name, attributeSource] of Object.entries(playerSource.attributes)) {
            attributes[name] = await Attribute.fromSource(parsingContext.withExtendedPath(`.attributes.${name}`), attributeSource, false);
        }

        // Update parsing context
        parsingContext = parsingContext.withPlayerAttributes(attributes);

        // Get ships
        let ships: Ship[] = [];
        for (let shipName of playerSource.ships) {

            // If ship does not exist
            if (!(shipName in parsingContext.shipEntries))
                throw new UnpackingError(`Could not find 'ships/${shipName}.json'`, parsingContext);

            // Unpack ship data
            let shipSource: IShipSource = await getJSONFromEntry(parsingContext.shipEntries[shipName]) as unknown as IShipSource;
            ships.push(await Ship.fromSource(parsingContext.withUpdatedFile(`ships/${shipName}.json`), shipSource, true));
        }

        // Return created Player object
        return new Player(spawnRegion, ships, attributes);
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