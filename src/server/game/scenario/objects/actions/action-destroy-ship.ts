import { UnpackingError }                         from '../../errors/unpacking-error';
import { checkAgainstSchema }                     from '../../schema-checker';
import { buildCondition }                         from '../conditions/condition-builder';
import { Action }                                 from './action';
import { actionDestroyShipSchema }                from './sources/action-destroy-ship';
import type { EventContext, GenericEventContext } from '../../events/event-context';
import type { EventEvaluationState }              from '../../events/event-evaluation-state';
import type { ParsingContext }                    from '../../parsing-context';
import type { Condition }                         from '../conditions/condition';
import type { Ship }                              from '../ship';
import type { IActionDestroyShipSource }          from './sources/action-destroy-ship';

/**
 * ActionDestroyShip - Server Version
 *
 * Action which removes a ship from the game
 */
export class ActionDestroyShip extends Action {

    /**
     * ActionDestroyShip constructor
     *
     * @param  ship      Ship to destroy. If undefined, will use ship found in event context
     * @param  priority  Priority to use for event listener created for this action
     * @param  condition Condition that must hold true for this action to execute
     */
    private constructor(private readonly ship: Ship | undefined,
                        priority: number,
                        condition: Condition) {
        super(priority, condition);
    }

    /**
     * Factory function to generate ActionDestroyShip from JSON scenario data
     *
     * @param    parsingContext          Context for resolving scenario data
     * @param    actionDestroyShipSource JSON data for ActionDestroyShip
     * @param    checkSchema             When true, validates source JSON data against schema
     * @returns                          Created ActionDestroyShip object
     */
    public static async fromSource(parsingContext: ParsingContext, actionDestroyShipSource: IActionDestroyShipSource, checkSchema: boolean): Promise<ActionDestroyShip> {

        // Validate JSON data against schema
        if (checkSchema)
            actionDestroyShipSource = await checkAgainstSchema(actionDestroyShipSource, actionDestroyShipSchema, parsingContext);

        // Get condition from source
        const condition = await buildCondition(parsingContext.withExtendedPath('.condition'), actionDestroyShipSource.condition, false);
        parsingContext.reducePath();

        let ship: Ship | undefined;
        switch (actionDestroyShipSource.ship) {
            case 'local':
                if (parsingContext.shipPartial === undefined)
                    throw new UnpackingError(`The 'destroyShip' action defined at '${parsingContext.currentPath}' is invalid. No ship to destroy.`,
                        parsingContext);
                ship = parsingContext.shipPartial as Ship;
                break;
            case 'foreign':
                if (parsingContext.currentEventInfo === undefined || !parsingContext.currentEventInfo[0].includes('ship'))
                    throw new UnpackingError(`The 'destroyShip' action defined at '${parsingContext.currentPath}' is invalid. No foreign ship to refer to.`,
                        parsingContext);

                ship = undefined;
                break;
        }

        return new ActionDestroyShip(ship, actionDestroyShipSource.priority ?? 0, condition);
    }

    /**
     * Executes this action's logic if action condition holds true
     * Current state of the evaluation
     *
     * @param  eventEvaluationState Current state of event evaluation
     * @param  eventContext         Context for resolving objects and values when an event is triggered
     */
    public execute(eventEvaluationState: EventEvaluationState, eventContext: GenericEventContext): void {
        super.execute(eventEvaluationState, eventContext);
        if (!this.condition.check(eventContext))
            return;

        const ship = this.ship ?? (eventContext as EventContext<'ship', any, any, any>).foreignShip;
        if (!ship.destroyed) {
            ship.deconstruct();
            ship.owner.removeShip(ship);
        }
    }
}
