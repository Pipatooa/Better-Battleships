import { FileJSON } from 'formidable';
import Joi from 'joi';
import { IScenarioInfo } from '../../../shared/network/scenario/i-scenario-info';
import { ITeamInfo } from '../../../shared/network/scenario/i-team-info';
import { getAttributes } from './attributes/attribute-getter';
import {
    attributeHolderSchema,
    AttributeMap,
    AttributeMapSource,
    IAttributeHolder
} from './attributes/i-attribute-holder';
import {
    ForeignAttributeRegistry,
    IForeignAttributeRegistrySource
} from './attributes/references/foreign-attribute-registry';
import { Board, IBoardSource } from './board';
import { Descriptor, descriptorSchema, IDescriptorSource } from './common/descriptor';
import { genericNameSchema } from './common/generic-name';
import { ParsingContext } from './parsing-context';
import { checkAgainstSchema } from './schema-checker';
import { ITeamSource, Team } from './team';
import { getJSONFromEntry, UnpackingError } from './unpacker';

/**
 * Scenario - Server Version
 *
 * Stores all information about the scenario and is the container object for most other objects in the scenario
 */
export class Scenario implements IAttributeHolder {

    public constructor(public readonly fileJSON: FileJSON,
                       public readonly author: string,
                       public readonly descriptor: Descriptor,
                       public readonly board: Board,
                       public readonly teams: { [name: string]: Team },
                       public readonly attributes: AttributeMap) {
    }

    /**
     * Factory function to generate Scenario from JSON scenario data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    scenarioSource JSON data from 'scenario.json'
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created Scenario object
     */
    public static async fromSource(parsingContext: ParsingContext, scenarioSource: IScenarioSource, checkSchema: boolean): Promise<Scenario> {

        // Validate JSON data against schema
        if (checkSchema)
            scenarioSource = await checkAgainstSchema(scenarioSource, scenarioSchema, parsingContext);

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), scenarioSource.attributes, 'scenario');
        parsingContext = parsingContext.withScenarioAttributes(attributes);

        // Get descriptor
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), scenarioSource.descriptor, false);

        // Get board
        const boardSource: IBoardSource = await getJSONFromEntry(parsingContext.boardEntry) as unknown as IBoardSource;
        const board = await Board.fromSource(parsingContext.withUpdatedFile('board.json'), boardSource, true);

        // Get foreign attribute registry and update parsing context
        const foreignAttributeRegistrySource = await getJSONFromEntry(parsingContext.foreignAttributeRegistryEntry) as unknown as IForeignAttributeRegistrySource;
        const foreignAttributeRegistry = await ForeignAttributeRegistry.fromSource(parsingContext.withUpdatedFile('foreign-attributes.json'), foreignAttributeRegistrySource, true);
        parsingContext = parsingContext.withForeignAttributeRegistry(foreignAttributeRegistry);

        // Get teams
        const teams: { [name: string]: Team } = {};
        for (const teamName of scenarioSource.teams) {

            // If team does not exist
            if (!(teamName in parsingContext.teamEntries))
                throw new UnpackingError(`Could not find 'teams/${teamName}.json'`, parsingContext);

            // Unpack team data
            const teamSource: ITeamSource = await getJSONFromEntry(parsingContext.teamEntries[teamName]) as unknown as ITeamSource;
            teams[teamName] = await Team.fromSource(parsingContext.withUpdatedFile(`teams/${teamName}.json`), teamSource, teamName, true);
        }

        // Return created Scenario object
        return new Scenario(parsingContext.scenarioFile, scenarioSource.author, descriptor, board, teams, attributes);
    }

    /**
     * Returns network transportable form of this object.
     *
     * May not include all details of the object. Just those that the client needs to know.
     *
     * @returns  Created IScenarioInfo object
     */
    public makeTransportable(): IScenarioInfo {
        const teamInfo: { [name: string]: ITeamInfo } = {};

        // Make all team objects transportable
        for (const [ name, team ] of Object.entries(this.teams)) {
            teamInfo[name] = team.makeTransportable();
        }

        // Return scenario info
        return {
            author: this.author,
            descriptor: this.descriptor.makeTransportable(),
            teams: teamInfo
        };
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IScenarioSource {
    author: string,
    descriptor: IDescriptorSource,
    teams: string[],
    attributes: AttributeMapSource
}

/**
 * Schema for validating source JSON data
 */
export const scenarioSchema = Joi.object({
    author: Joi.string().required(),
    descriptor: descriptorSchema.required(),
    teams: Joi.array().items(genericNameSchema).min(2).max(8).required()
}).concat(attributeHolderSchema);
