import Joi from 'joi';
import {Attribute, IAttributeSource} from './attributes/attribute';
import {attributeHolderSchema, AttributeMap, IAttributeHolder} from './attributes/i-attribute-holder';
import {Board, IBoardSource} from './board';
import {Descriptor, descriptorSchema, IDescriptorSource} from './common/descriptor';
import {genericNameSchema} from './common/generic-name';
import {ParsingContext} from './parsing-context';
import {WithSchema} from './schema-checker';
import {ITeamSource, Team} from './team';
import {getJSONFromEntry, UnpackingError} from './unpacker';

/**
 * Scenario - Server Version
 *
 * Stores all information about the scenario and is the container object for most other objects in the scenario
 */
export class Scenario implements IAttributeHolder {

    public constructor(public readonly descriptor: Descriptor,
                       public readonly board: Board,
                       public readonly teams: { [name: string]: Team },
                       public readonly attributes: AttributeMap) {
    }

    /**
     * Factory function to generate Scenario from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param scenarioSource JSON data from 'scenario.json'
     * @param checkSchema When true, validates source JSON data against schema
     * @returns scenario -- Created Scenario object
     */
    @WithSchema()
    public static async fromSource(parsingContext: ParsingContext, scenarioSource: IScenarioSource, checkSchema: boolean): Promise<Scenario> {

        // Get attributes
        let attributes: AttributeMap = {};
        for (let [name, attributeSource] of Object.entries(scenarioSource.attributes)) {
            attributes[name] = await Attribute.fromSource(parsingContext.withExtendedPath(`.attributes.${name}`), attributeSource, true);
        }

        // Update parsing context
        parsingContext = parsingContext.withScenarioAttributes(attributes);

        // Get descriptor
        let descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), scenarioSource.descriptor, true);

        // Get board
        let boardSource: IBoardSource = await getJSONFromEntry(parsingContext.boardEntry) as unknown as IBoardSource;
        let board = await Board.fromSource(parsingContext.withUpdatedFile('board.json'), boardSource, true);

        // Get teams
        let teams: { [name: string]: Team } = {};
        for (let teamName of scenarioSource.teams) {

            // If team does not exist
            if (!(teamName in parsingContext.teamEntries))
                throw new UnpackingError(`Could not find 'teams/${teamName}.json'`, parsingContext);

            // Unpack team data
            let teamSource: ITeamSource = await getJSONFromEntry(parsingContext.teamEntries[teamName]) as unknown as ITeamSource;
            teams[teamName] = await Team.fromSource(parsingContext.withUpdatedFile(`teams/${teamName}.json`), teamSource, false);
        }

        // Return created Scenario object
        return new Scenario(descriptor, board, teams, attributes);
    }

    /**
     * Schema for validating source JSON data
     */
    public static schema = Joi.object({
        author: Joi.string().required(),
        descriptor: descriptorSchema.required(),
        teams: Joi.array().items(genericNameSchema).min(2).max(8).required()
    }).concat(attributeHolderSchema);
}

/**
 * JSON source interface reflecting schema
 */
export interface IScenarioSource {
    author: string;
    descriptor: IDescriptorSource;
    teams: string[];
    attributes: IAttributeSource[];
}

/**
 * Schema for validating source JSON data
 */
export const scenarioSchema = Joi.object({
    author: Joi.string().required(),
    descriptor: descriptorSchema.required(),
    teams: Joi.array().items(genericNameSchema).min(2).max(8).required()
}).concat(attributeHolderSchema);
