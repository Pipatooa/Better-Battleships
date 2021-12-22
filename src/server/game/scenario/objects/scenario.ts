import { baseEventInfo }                                                          from '../events/base-events';
import { EventRegistrar }                                                         from '../events/event-registrar';
import { checkAgainstSchema }                                                     from '../schema-checker';
import { TurnManager }                                                            from '../turn-manager';
import { getJSONFromEntry, UnpackingError }                                       from '../unpacker';
import { eventListenersFromActionSource }                                         from './actions/action-getter';
import { getAttributeListeners }                                                  from './attribute-listeners/attribute-listener-getter';
import { ForeignAttributeRegistry }                                               from './attribute-references/foreign-attribute-registry';
import { AttributeCodeControlled }                                                from './attributes/attribute-code-controlled';
import { getAttributes }                                                          from './attributes/attribute-getter';
import { Board }                                                                  from './board';
import { Descriptor }                                                             from './common/descriptor';
import { scenarioSchema }                                                         from './sources/scenario';
import { Team }                                                                   from './team';
import type { BaseEvent, BaseEventInfo }                                          from '../events/base-events';
import type { ParsingContext }                                                    from '../parsing-context';
import type { ForeignAttributeRegistrySource }                                    from './attribute-references/sources/foreign-attribute-registry';
import type { IAttributeHolder, IBuiltinAttributeHolder, BuiltinAttributeRecord } from './attributes/attribute-holder';
import type { AttributeMap }                                                      from './attributes/i-attribute-holder';
import type { IBoardSource }                                                      from './sources/board';
import type { IScenarioSource }                                                   from './sources/scenario';
import type { ITeamSource }                                                       from './sources/team';
import type { FileJSON }                                                          from 'formidable';
import type { IScenarioInfo }                                                     from 'shared/network/scenario/i-scenario-info';
import type { ITeamInfo }                                                         from 'shared/network/scenario/i-team-info';

/**
 * Scenario - Server Version
 *
 * Stores all information about the scenario and is the container object for most other objects in the scenario
 */
export class Scenario implements IAttributeHolder, IBuiltinAttributeHolder<'scenario'> {

    public constructor(public readonly fileJSON: FileJSON,
                       public readonly author: string,
                       public readonly descriptor: Descriptor,
                       public readonly board: Board,
                       public readonly teams: { [name: string]: Team },
                       public readonly turnManager: TurnManager,
                       public readonly eventRegistrar: EventRegistrar<BaseEventInfo, BaseEvent>,
                       public readonly attributes: AttributeMap,
                       public readonly builtinAttributes: BuiltinAttributeRecord<'scenario'>) {
    }

    /**
     * Generates built-in attributes for Scenario object
     *
     * @param    object Object to generate built-in attributes for
     * @returns         Record of built-in attributes for the object
     */
    private static generateBuiltinAttributes(object: Scenario): BuiltinAttributeRecord<'scenario'> {
        return {
            teamCount: new AttributeCodeControlled(() => Object.entries(object.teams).length)
        };
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

        // Scenario and TurnManager partials refer to future Scenario and TurnManager objects
        const scenarioPartial: Partial<Scenario> = {};
        const turnManagerPartial: Partial<TurnManager> = {};
        parsingContext.scenarioPartial = scenarioPartial;
        parsingContext.turnManagerPartial = turnManagerPartial;

        // Get foreign attribute registry and update parsing context
        const foreignAttributeRegistrySource = await getJSONFromEntry(parsingContext.foreignAttributeRegistryEntry) as unknown as ForeignAttributeRegistrySource;
        parsingContext.foreignAttributeRegistry = await ForeignAttributeRegistry.fromSource(parsingContext.withFile('foreign-attributes.json'), foreignAttributeRegistrySource, true);
        parsingContext.reduceFileStack();

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), scenarioSource.attributes, 'scenario');
        const builtinAttributes = Scenario.generateBuiltinAttributes(scenarioPartial as Scenario);
        parsingContext.localAttributes.scenario = [attributes, builtinAttributes];
        parsingContext.reducePath();

        const attributeListeners = await getAttributeListeners(parsingContext.withExtendedPath('.attributeListeners'), scenarioSource.attributeListeners);
        parsingContext.reducePath();
        for (const attributeListener of attributeListeners)
            attributeListener.register();

        // Get descriptor
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), scenarioSource.descriptor, false);
        parsingContext.reducePath();

        // Get board
        const boardSource: IBoardSource = await getJSONFromEntry(parsingContext.boardEntry) as unknown as IBoardSource;
        const board = await Board.fromSource(parsingContext.withFile('board.json'), boardSource, true);
        parsingContext.reduceFileStack();
        parsingContext.board = board;

        // Get teams
        const teams: { [name: string]: Team } = {};
        const teamsList: Team[] = [];
        const subRegistrars: EventRegistrar<BaseEventInfo, BaseEvent>[] = [];
        for (const teamName of scenarioSource.teams) {

            // If team does not exist
            if (!(teamName in parsingContext.teamEntries))
                throw new UnpackingError(`Could not find 'teams/${teamName}.json'`, parsingContext);

            // Unpack team data
            const teamSource: ITeamSource = await getJSONFromEntry(parsingContext.teamEntries[teamName]) as unknown as ITeamSource;
            const team = await Team.fromSource(parsingContext.withFile(`teams/${teamName}.json`), teamSource, teamName, true);
            subRegistrars.push(team.eventRegistrar);
            parsingContext.reduceFileStack();
            teams[teamName] = team;
            teamsList.push(team);
        }

        // Create turn manager
        TurnManager.call(turnManagerPartial, scenarioSource.turnOrdering, teamsList, scenarioSource.maxTurnTime);
        (turnManagerPartial as any).__proto__ = TurnManager.prototype;

        const eventListeners = await eventListenersFromActionSource(parsingContext.withExtendedPath('.actions'), baseEventInfo, scenarioSource.actions);
        parsingContext.reducePath();

        // Return created Scenario object
        parsingContext.turnManagerPartial = undefined;
        parsingContext.localAttributes.scenario = undefined;
        parsingContext.board = undefined;
        parsingContext.foreignAttributeRegistry = undefined;
        const eventRegistrar = new EventRegistrar(eventListeners, subRegistrars);
        return new Scenario(parsingContext.scenarioFile, scenarioSource.author, descriptor, board, teams, turnManagerPartial as TurnManager, eventRegistrar, attributes, builtinAttributes);
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

