import { UnpackingError }                from '../../errors/unpacking-error';
import { checkAgainstSchema }            from '../../schema-checker';
import { buildCondition }                from '../conditions/condition-builder';
import { Action }                        from './action';
import { actionReplaceTileSchema }       from './sources/action-replace-tile';
import type { GenericEventContext }      from '../../events/event-context';
import type { EventEvaluationState }     from '../../events/event-evaluation-state';
import type { ParsingContext }           from '../../parsing-context';
import type { Board }                    from '../board';
import type { Condition }                from '../conditions/condition';
import type { TileType }                 from '../tiletype';
import type { IActionReplaceTileSource } from './sources/action-replace-tile';

/**
 * ActionReplaceTile - Server Version
 *
 * Action which replaces tiles on the board
 */
export class ActionReplaceTile extends Action {

    /**
     * ActionReplaceTile constructor
     *
     * @param  board       Board to update tiles on
     * @param  location    Location to replace tiles within
     * @param  oldTileType Existing tile type to replace
     * @param  newTileType Tile type to replace tiles with
     * @param  priority    Priority to use for event listener created for this action
     * @param  condition   Condition that must hold true for this action to execute
     */
    private constructor(private readonly board: Board,
                        private readonly location: string,
                        private readonly oldTileType: TileType,
                        private readonly newTileType: TileType,
                        priority: number,
                        condition: Condition) {
        super(priority, condition);
    }

    /**
     * Factory function to generate ActionReplaceTile from JSON scenario data
     *
     * @param    parsingContext          Context for resolving scenario data
     * @param    actionReplaceTileSource JSON data for ActionReplaceTile
     * @param    checkSchema             When true, validates source JSON data against schema
     * @returns                          Created ActionReplaceTile object
     */
    public static async fromSource(parsingContext: ParsingContext, actionReplaceTileSource: IActionReplaceTileSource, checkSchema: boolean): Promise<ActionReplaceTile> {

        // Validate JSON data against schema
        if (checkSchema)
            actionReplaceTileSource = await checkAgainstSchema(actionReplaceTileSource, actionReplaceTileSchema, parsingContext);

        // Get condition from source
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), actionReplaceTileSource.condition, false);
        parsingContext.reducePath();

        // Check if location exists to be reference
        const location = actionReplaceTileSource.location;
        if (parsingContext.currentEventInfo === undefined || !parsingContext.currentEventInfo[2].includes(location))
            throw new UnpackingError(`Could not find location '${location}' defined at '${parsingContext.currentPathPrefix}location'.`,
                parsingContext);
        
        // Get old tile type from board
        const board = parsingContext.boardPartial as Board;
        const oldTileChar = actionReplaceTileSource.oldTile;
        const oldTileType = board.tileTypes[oldTileChar];
        if (oldTileType === undefined)
            throw new UnpackingError(`Could not find tile type '${oldTileChar}' defined at '${parsingContext.currentPathPrefix}oldTile'. Check 'board${parsingContext.scenarioFileExtension}'.`,
                parsingContext);

        // Get new tile type from board
        const newTileChar = actionReplaceTileSource.newTile;
        const newTileType = board.tileTypes[newTileChar];
        if (newTileType === undefined)
            throw new UnpackingError(`Could not find tile type '${newTileChar}' defined at '${parsingContext.currentPathPrefix}newTile'. Check 'board${parsingContext.scenarioFileExtension}'.`,
                parsingContext);

        // Return created ActionReplaceTile object
        return new ActionReplaceTile(board, location, oldTileType, newTileType, actionReplaceTileSource.priority ?? 0, condition);
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  eventEvaluationState Current state of event evaluation
     * @param  eventContext         Context for resolving objects and values when an event is triggered
     */
    public execute(eventEvaluationState: EventEvaluationState, eventContext: GenericEventContext): void {
        super.execute(eventEvaluationState, eventContext);
        if (!this.condition.check(eventContext))
            return;

        const tiles = eventContext.locations[this.location];
        this.board.replaceTileTypes(tiles, this.oldTileType, this.newTileType);
    }
}
