import Joi from 'joi';
import {Attribute} from './attributes/attribute';
import {
    attributeHolderSchema,
    AttributeMap,
    AttributeMapSource,
    IAttributeHolder
} from './attributes/i-attribute-holder';
import {colorSchema} from './common/color';
import {Descriptor, descriptorSchema, IDescriptorSource} from './common/descriptor';
import {genericNameSchema} from './common/generic-name';
import {ParsingContext} from './parsing-context';
import {IPlayerSource, Player} from './player';
import {checkAgainstSchema} from './schema-checker';
import {getJSONFromEntry, UnpackingError} from './unpacker';

/**
 * Team - Server Version
 *
 * Contains information about a collection of players
 */
export class Team implements IAttributeHolder {
    public readonly players: Player[] = [];

    /**
     * Team constructor
     * @param descriptor Descriptor for team
     * @param playerPrototypes Array of potential players for the team
     * @param color Team color
     * @param attributes Attributes for the team
     */
    public constructor(public readonly descriptor: Descriptor,
                       public readonly playerPrototypes: Player[][],
                       public readonly color: string,
                       public readonly attributes: AttributeMap) {

    }

    /**
     * Factory function to generate Team from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param teamSource JSON data for Team
     * @param checkSchema When true, validates source JSON data against schema
     * @returns team -- Created Team object
     */
    public static async fromSource(parsingContext: ParsingContext, teamSource: ITeamSource, checkSchema: boolean): Promise<Team> {

        // Validate JSON data against schema
        if (checkSchema)
            teamSource = await checkAgainstSchema(teamSource, teamSchema, parsingContext);

        // Get attributes
        let attributes: AttributeMap = {};
        for (let [name, attributeSource] of Object.entries(teamSource.attributes)) {
            attributes[name] = await Attribute.fromSource(parsingContext.withExtendedPath(`.attributes.${name}`), attributeSource, true);
        }

        // Update parsing context
        parsingContext = parsingContext.withTeamAttributes(attributes);

        // Get descriptor
        let descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), teamSource.descriptor, true);

        // Get player prototypes for each possible player count
        let playerPrototypes: Player[][] = [];
        for (let i = 0; i < teamSource.playerConfigs.length; i++) {
            let playerConfigs: IPlayerConfig[] = teamSource.playerConfigs[i];
            let playerCount: number = i + 1;

            // Check player count and length of specified player configs are the same
            if (playerCount !== playerConfigs.length)
                throw new UnpackingError(`'${parsingContext.currentPath}playerConfigs[${i}]' must contain ${playerCount} items`, parsingContext);

            // Get players from player configs
            let players: Player[] = [];
            for (let playerConfig of playerConfigs) {

                let playerName = playerConfig.playerPrototype;

                // If player does not exist
                if (!(playerName in parsingContext.playerPrototypeEntries))
                    throw new UnpackingError(`Could not find 'players/${playerName}.json'`, parsingContext);

                // Unpack player
                let playerSource: IPlayerSource = await getJSONFromEntry(parsingContext.playerPrototypeEntries[playerName]) as unknown as IPlayerSource;
                players.push(await Player.fromSource(parsingContext.withUpdatedFile(`players/${playerName}.json`), playerConfig.spawnRegion, playerSource, false));
            }

            // Add list of players to list of possible player configurations
            playerPrototypes.push(players);
        }

        // Return created Team object
        return new Team(descriptor, playerPrototypes, teamSource.color, attributes);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface ITeamSource {
    descriptor: IDescriptorSource,
    color: string,
    playerConfigs: IPlayerConfig[][],
    attributes: AttributeMapSource
}

/**
 * JSON source interface reflecting sub-schema
 */
export interface IPlayerConfig {
    playerPrototype: string,
    spawnRegion: string
}

/**
 * Schema for validating source JSON data
 */
export const teamSchema = Joi.object({
    descriptor: descriptorSchema.required(),
    color: colorSchema.required(),
    playerConfigs: Joi.array().items(Joi.array().items(Joi.object({
        playerPrototype: genericNameSchema.required(),
        spawnRegion: genericNameSchema.required()
    })).min(1)).min(1).max(8).required()
}).concat(attributeHolderSchema);