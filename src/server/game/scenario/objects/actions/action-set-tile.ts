import { UnpackingError }            from '../../errors/unpacking-error';
import { checkAgainstSchema }        from '../../schema-checker';
import { buildCondition }            from '../conditions/condition-builder';
import { Action }                    from './action';
import { actionSetTileSchema }       from './sources/action-set-tile';
import type { GenericEventContext }  from '../../events/event-context';
import type { EventEvaluationState } from '../../events/event-evaluation-state';
import type { ParsingContext }       from '../../parsing-context';
import type { Board }                from '../board';
import type { Condition }            from '../conditions/condition';
import type { TileType }             from '../tiletype';
import type { IActionSetTileSource } from './sources/action-set-tile';

/**
 * ActionSetTile - Server Version
 *
 * Action which replaces tiles on the board
 */
export class ActionSetTile extends Action {

    /**
     * ActionSetTile constructor
     *
     * @param  priority  Priority to use for event listener created for this action
     * @param  condition Condition that must hold true for this action to execute
     * @param  board     Board to update tiles on
     * @param  location  Location to replace tiles within
     * @param  tileType  Tile type to replace tiles with
     * @private
     */
    private constructor(priority: number,
                        condition: Condition,
                        private readonly board: Board,
                        private readonly location: string,
                        private readonly tileType: TileType) {
        super(priority, condition);
    }

    /**
     * Factory function to generate ActionSetTile from JSON scenario data
     *
     * @param    parsingContext      Context for resolving scenario data
     * @param    actionSetTileSource JSON data for ActionSetTile
     * @param    checkSchema         When true, validates source JSON data against schema
     * @returns                      Created ActionSetTile object
     */
    public static async fromSource(parsingContext: ParsingContext, actionSetTileSource: IActionSetTileSource, checkSchema: boolean): Promise<ActionSetTile> {

        // Validate JSON data against schema
        if (checkSchema)
            actionSetTileSource = await checkAgainstSchema(actionSetTileSource, actionSetTileSchema, parsingContext);

        // Get condition from source
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), actionSetTileSource.condition, false);
        parsingContext.reducePath();

        // Check if location exists to be reference
        const location = actionSetTileSource.location;
        if (parsingContext.currentEventInfo === undefined || !parsingContext.currentEventInfo[2].includes(location))
            throw new UnpackingError(`Could not find location '${location}' defined at '${parsingContext.currentPathPrefix}location'.`, 
                parsingContext);
        
        // Get tile type from board
        const board = parsingContext.boardPartial as Board;
        const tileChar = actionSetTileSource.tile;
        const tileType = board.tileTypes[tileChar];
        if (tileType === undefined)
            throw new UnpackingError(`Could not find tile type '${tileChar}' defined at '${parsingContext.currentPathPrefix}tile'. Check 'board${parsingContext.scenarioFileExtension}'.`,
                parsingContext);

        // Return created ActionSetTile object
        return new ActionSetTile(actionSetTileSource.priority ?? 0, condition, board, location, tileType);
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
        this.board.setTileTypes(tiles, this.tileType);
    }
}
