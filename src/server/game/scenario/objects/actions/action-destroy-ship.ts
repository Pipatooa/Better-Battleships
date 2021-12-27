import { checkAgainstSchema }                          from '../../schema-checker';
import { UnpackingError }                              from '../../unpacker';
import { buildCondition }                              from '../conditions/condition-builder';
import { Action }                                      from './action';
import { actionDestroyShipSchema }                     from './sources/action-destroy-ship';
import type { ECA, EventContext, GenericEventContext } from '../../events/event-context';
import type { ParsingContext }                         from '../../parsing-context';
import type { Condition }                              from '../conditions/condition';
import type { Ship }                                   from '../ship';
import type { IActionDestroyShipSource }               from './sources/action-destroy-ship';

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
     * @param  condition Condition that must hold true for this action to execute
     */
    private constructor(private readonly ship: Ship | undefined,
                        condition: Condition) {
        super(condition);
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
                ship = parsingContext.shipPartial as Ship;
                break;
            case 'foreign':
                if (parsingContext.currentEventInfo === undefined || !parsingContext.currentEventInfo[0].includes('ship'))
                    throw new UnpackingError(`The 'destroyShip' action defined at '${parsingContext.currentPath}' is invalid. No foreign ship to refer to.`,
                        parsingContext);

                ship = undefined;
                break;
        }

        return new ActionDestroyShip(ship, condition);
    }

    /**
     * Executes this action's logic if action condition holds true
     *
     * @param  eventContext Context for resolving objects and values when an event is triggered
     */
    public execute(eventContext: GenericEventContext): void {

        if (!this.condition.check(eventContext))
            return;

        const ship = this.ship ?? (eventContext as EventContext<'ship', ECA>).foreignShip;
        ship.deconstruct();
        ship.owner.removeShip(ship);
    }
}
