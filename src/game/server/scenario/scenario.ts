import {IZipEntry} from 'adm-zip';
import Joi from 'joi';
import {Attribute, IAttributeSource} from './attributes/attribute';
import {attributeHolderSchema, AttributeMap, IAttributeHolder} from './attributes/i-attribute-holder';
import {Board, IBoardSource} from './board';
import {Descriptor, descriptorSchema, IDescriptorSource} from './common/descriptor';
import {genericNameSchema} from './common/generic-name';
import {ITeamSource, Team} from './team';
import {getJSONFromEntry, UnpackingError, zipEntryMap} from './unpacker';

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
     * @param scenarioSource JSON data from 'scenario.json'
     * @param boardEntry ZIP entry for board JSON
     * @param teamEntries ZIP entry list of JSON teams
     * @param playerEntries ZIP entry list of JSON players
     * @param shipEntries ZIP entry list of JSON ships
     * @param abilityEntries ZIP entry list of JSON abilities
     * @returns scenario -- Created Scenario object
     */
    public static async fromSource(scenarioSource: IScenarioSource, boardEntry: IZipEntry,
                                   teamEntries: zipEntryMap,
                                   playerEntries: zipEntryMap,
                                   shipEntries: zipEntryMap,
                                   abilityEntries: zipEntryMap): Promise<Scenario> {

        // Validate JSON data against schema
        try {
            scenarioSource = await scenarioSchema.validateAsync(scenarioSource);
        } catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
            throw e;
        }

        // Get descriptor
        let descriptor: Descriptor = await Descriptor.fromSource(scenarioSource.descriptor);

        // Get board
        let boardSource = await getJSONFromEntry(boardEntry) as unknown as IBoardSource;
        let board: Board = await Board.fromSource(boardSource);

        // Get teams
        let teams: { [name: string]: Team } = {};
        for (let teamName of scenarioSource.teams) {

            // If team does not exist
            if (!(teamName in teamEntries))
                throw new UnpackingError(`Could not find 'teams/${teamName}.json'`).withContext('scenario.json');

            // Unpack team data
            let teamSource = await getJSONFromEntry(teamEntries[teamName]) as unknown as ITeamSource;

            try {
                teams[teamName] = await Team.fromSource(teamSource, playerEntries, shipEntries, abilityEntries);
            } catch (e) {
                if (e instanceof UnpackingError)
                    throw e.hasContext() ? e : e.withContext(`teams/${teamName}.json`);
                throw e;
            }
        }

        // Get attributes
        let attributes: AttributeMap = {};
        for (let [name, attributeSource] of Object.entries(scenarioSource.attributes)) {
            attributes[name] = await Attribute.fromSource(attributeSource);
        }

        // Return created Scenario object
        return new Scenario(descriptor, board, teams, attributes);
    }
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
