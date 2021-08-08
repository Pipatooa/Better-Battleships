import Joi from 'joi';
import {Attribute} from './attributes/attribute';
import {
    attributeHolderSchema,
    AttributeMap,
    AttributeMapSource,
    IAttributeHolder
} from './attributes/i-attribute-holder';
import {genericNameSchema} from './common/generic-name';
import {IShipSource, Ship} from './ship';
import {getJSONFromEntry, UnpackingError, zipEntryMap} from './unpacker';

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
     * @param spawnRegion Region that the player should first be allowed to place ships in
     * @param playerSource JSON data for Player
     * @param shipEntries ZIP entry list of JSON ships
     * @param abilityEntries ZIP entry list of JSON abilities
     * @returns player -- Created Player object
     */
    public static async fromSource(spawnRegion: string, playerSource: IPlayerSource,
                                   shipEntries: zipEntryMap,
                                   abilityEntries: zipEntryMap): Promise<Player> {
        // Validate JSON data against schema
        try {
            playerSource = await playerSchema.validateAsync(playerSource);
        } catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
            throw e;
        }

        // Get ships
        let ships: Ship[] = [];
        for (let shipName of playerSource.ships) {

            // If ship does not exist
            if (!(shipName in shipEntries))
                throw new UnpackingError(`Could not find 'ships/${shipName}.json'`);

            // Unpack ship data
            let shipSource = await getJSONFromEntry(shipEntries[shipName]) as unknown as IShipSource;

            try {
                ships.push(await Ship.fromSource(shipSource, abilityEntries));
            } catch (e) {
                if (e instanceof UnpackingError)
                    throw e.hasContext() ? e : e.withContext(`ships/${shipName}.json`);
                throw e;
            }
        }

        // Get attributes
        let attributes: AttributeMap = {};
        for (let [name, attributeSource] of Object.entries(playerSource.attributes)) {
            attributes[name] = await Attribute.fromSource(attributeSource);
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