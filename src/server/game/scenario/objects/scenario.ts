import fs                                                                         from 'fs';
import { UnpackingError }                                                         from '../errors/unpacking-error';
import { baseEventInfo }                                                          from '../events/base-events';
import { EventRegistrar }                                                         from '../events/event-registrar';
import { checkAgainstSchema }                                                     from '../schema-checker';
import { TurnManager }                                                            from '../turn-manager';
import { getJSONFromEntry }                                                       from '../unpacker';
import { getEventListenersFromActionSource }                                      from './actions/action-getter';
import { getAttributeListeners }                                                  from './attribute-listeners/attribute-listener-getter';
import { ForeignAttributeRegistry }                                               from './attribute-references/foreign-attribute-registry';
import { AttributeCodeControlled }                                                from './attributes/attribute-code-controlled';
import { getAttributes }                                                          from './attributes/attribute-getter';
import { AttributeWatcher }                                                       from './attributes/attribute-watcher';
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
import type { Game }                                                              from 'server/game/game';
import type { IScenarioInfo }                                                     from 'shared/network/scenario/i-scenario-info';
import type { ITeamInfo }                                                         from 'shared/network/scenario/i-team-info';

/**
 * Scenario - Server Version
 *
 * Stores all information about the scenario and is the container object for most other objects in the scenario
 */
export class Scenario implements IAttributeHolder, IBuiltinAttributeHolder<'scenario'> {

    public game: Game | undefined;
    public readonly attributeWatcher: AttributeWatcher;

    /**
     * Scenario constructor
     *
     * @param  fileJSON          Scenario file sent by client
     * @param  author            Author of scenario
     * @param  descriptor        Descriptor for scenario
     * @param  board             Board for scenario
     * @param  teams             Teams for scenario
     * @param  turnManager       Turn manager for scenario
     * @param  eventRegistrar    Event registrar for scenario
     * @param  attributes        Attributes for scenario
     * @param  builtinAttributes Built-in attributes for scenario
     */
    public constructor(private readonly fileJSON: FileJSON,
                       public readonly author: string,
                       public readonly descriptor: Descriptor,
                       public readonly board: Board,
                       public readonly teams: { [name: string]: Team },
                       public readonly turnManager: TurnManager,
                       public readonly eventRegistrar: EventRegistrar<BaseEventInfo, BaseEvent>,
                       public readonly attributes: AttributeMap,
                       public readonly builtinAttributes: BuiltinAttributeRecord<'scenario'>) {

        this.attributeWatcher = new AttributeWatcher(this.attributes, this.builtinAttributes);
        this.eventRegistrar.eventEvaluationCompleteCallback = () => this.exportAttributeUpdates();
    }

    /**
     * Allows this object to be discarded
     */
    public deconstruct(): void {
        fs.unlink(this.fileJSON.filepath, () => {});
    }

    /**
     * Generates built-in attributes for Scenario object
     *
     * @param    object Object to generate built-in attributes for
     * @returns         Record of built-in attributes for the object
     */
    private static generateBuiltinAttributes(object: Scenario): BuiltinAttributeRecord<'scenario'> {
        return {
            teamCount: new AttributeCodeControlled(undefined, true, () => Object.entries(object.teams).length, () => {})
        };
    }

    /**
     * Factory function to generate Scenario from JSON scenario data
     *
     * @param    parsingContext Context for resolving scenario data
     * @param    scenarioSource JSON data from 'scenario.json' or 'scenario.yaml'
     * @param    checkSchema    When true, validates source JSON data against schema
     * @returns                 Created Scenario object
     */
    public static async fromSource(parsingContext: ParsingContext, scenarioSource: IScenarioSource, checkSchema: boolean): Promise<Scenario> {

        // Validate JSON data against schema
        if (checkSchema)
            scenarioSource = await checkAgainstSchema(scenarioSource, scenarioSchema, parsingContext);

        // Scenario, TurnManager and EventRegistrar partials refer to future Scenario, TurnManager and EventRegistrar objects
        const scenarioPartial: Partial<Scenario> = Object.create(Scenario.prototype);
        const turnManagerPartial: Partial<TurnManager> = Object.create(TurnManager.prototype);
        const eventRegistrarPartial = Object.create(EventRegistrar.prototype) as EventRegistrar<BaseEventInfo, BaseEvent>;
        parsingContext.scenarioPartial = scenarioPartial;
        parsingContext.turnManagerPartial = turnManagerPartial;

        // Get foreign attribute registry and update parsing context
        const foreignAttributeRegistrySource = await getJSONFromEntry(parsingContext.foreignAttributeRegistryEntry, parsingContext.scenarioFormat) as unknown as ForeignAttributeRegistrySource;
        parsingContext.foreignAttributeRegistry = await ForeignAttributeRegistry.fromSource(parsingContext.withFile(`foreign-attributes${parsingContext.scenarioFileExtension}`), foreignAttributeRegistrySource, true);
        parsingContext.reduceFileStack();

        // Get attributes and update parsing context
        const attributes: AttributeMap = await getAttributes(parsingContext.withExtendedPath('.attributes'), scenarioSource.attributes, 'scenario');
        const builtinAttributes = Scenario.generateBuiltinAttributes(scenarioPartial as Scenario);
        parsingContext.localAttributes.scenario = [attributes, builtinAttributes];
        parsingContext.reducePath();

        const attributeListeners = await getAttributeListeners(parsingContext.withExtendedPath('.attributeListeners'), scenarioSource.attributeListeners, eventRegistrarPartial);
        parsingContext.reducePath();
        for (const attributeListener of attributeListeners)
            attributeListener.register();

        // Get descriptor
        const descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), scenarioSource.descriptor, false);
        parsingContext.reducePath();

        // Get board
        const boardSource: IBoardSource = await getJSONFromEntry(parsingContext.boardEntry, parsingContext.scenarioFormat) as unknown as IBoardSource;
        const board = await Board.fromSource(parsingContext.withFile(`board${parsingContext.scenarioFileExtension}`), boardSource, true);
        parsingContext.reduceFileStack();
        parsingContext.boardPartial = board;

        // Get teams
        const teams: { [name: string]: Team } = {};
        const teamsList: Team[] = [];
        const subRegistrars: EventRegistrar<BaseEventInfo, BaseEvent>[] = [board.eventRegistrar];
        for (const teamName of scenarioSource.teams) {

            // If team does not exist
            if (!(teamName in parsingContext.teamEntries))
                throw new UnpackingError(`Could not find 'teams/${teamName}${parsingContext.scenarioFileExtension}'`, parsingContext);

            // Unpack team data
            const teamSource: ITeamSource = await getJSONFromEntry(parsingContext.teamEntries[teamName], parsingContext.scenarioFormat) as unknown as ITeamSource;
            const team = await Team.fromSource(parsingContext.withFile(`teams/${teamName}${parsingContext.scenarioFileExtension}`), teamSource, teamName, true);
            subRegistrars.push(team.eventRegistrar);
            parsingContext.reduceFileStack();
            teams[teamName] = team;
            teamsList.push(team);
        }

        // Create turn manager
        TurnManager.call(turnManagerPartial, scenarioPartial as Scenario, scenarioSource.turnOrdering, scenarioSource.randomiseTurns, teamsList, scenarioSource.maxTurnTime);

        const eventListeners = await getEventListenersFromActionSource(parsingContext.withExtendedPath('.actions'), baseEventInfo, scenarioSource.actions);
        parsingContext.reducePath();

        // Return created Scenario object
        parsingContext.turnManagerPartial = undefined;
        parsingContext.localAttributes.scenario = undefined;
        parsingContext.boardPartial = undefined;
        parsingContext.foreignAttributeRegistry = undefined;
        EventRegistrar.call(eventRegistrarPartial, parsingContext.scenarioPartial as Scenario, eventListeners, subRegistrars);
        Scenario.call(scenarioPartial, parsingContext.scenarioFile, scenarioSource.author, descriptor, board, teams, turnManagerPartial as TurnManager, eventRegistrarPartial, attributes, builtinAttributes);
        return scenarioPartial as Scenario;
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
        for (const [name, team] of Object.entries(this.teams)) {
            teamInfo[name] = team.makeTransportable();
        }

        // Return scenario info
        return {
            author: this.author,
            descriptor: this.descriptor.makeTransportable(),
            teams: teamInfo
        };
    }

    /**
     * Notifies clients of any attribute updates which have occurred on this team
     */
    public exportAttributeUpdates(): void {
        if (!this.attributeWatcher.updatesAvailable)
            return;

        this.game!.broadcastEvent({
            event: 'scenarioAttributeUpdate',
            attributes: this.attributeWatcher.exportUpdates()
        });
    }

    /**
     * Checks whether this game is over
     *
     * @returns  Whether this game is over
     */
    public checkGameOver(): boolean {
        let winningTeam: Team | undefined;
        for (const team of Object.values(this.teams)) {
            if (!team.lost && !team.inactive) {
                if (winningTeam === undefined)
                    winningTeam = team;
                else
                    return false;
            }
        }

        // Check if at least one player in the winning team is connected
        if (winningTeam !== undefined) {
            let winningTeamInvalid = true;
            for (const player of winningTeam.players)
                if (player.client!.connected)
                    winningTeamInvalid = false;
            if (winningTeamInvalid)
                winningTeam = undefined;
        }

        if (winningTeam === undefined) {
            this.turnManager.stop();
            this.game!.killGame('No Winner');
            return true;
        }

        if (this.eventRegistrar.eventEvaluationState !== undefined)
            this.eventRegistrar.eventEvaluationState.terminate = true;

        this.turnManager.stop();
        this.game!.endGame(winningTeam.id, winningTeam.winMessage);
        return true;
    }
}
