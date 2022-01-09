import { checkAgainstSchema }   from '../../schema-checker';
import { ActionAdvanceTurn }    from './action-advance-turn';
import { ActionDestroyShip }    from './action-destroy-ship';
import { ActionDisplayMessage } from './action-display-message';
import { ActionLose }           from './action-lose';
import { ActionSetAttribute }   from './action-set-attribute';
import { ActionWin }            from './action-win';
import { actionSchema }         from './sources/action';
import type { ParsingContext }  from '../../parsing-context';
import type { Action }          from './action';
import type { ActionSource }    from './sources/action';

/**
 * Factory function to generate Action from JSON scenario data
 *
 * @param    parsingContext Context for resolving scenario data
 * @param    actionSource   JSON data for Action
 * @param    checkSchema    When true, validates source JSON data against schema
 * @returns                 Created Action object
 */
export async function buildAction(parsingContext: ParsingContext, actionSource: ActionSource, checkSchema: boolean): Promise<Action> {

    // Validate JSON data against schema
    if (checkSchema)
        actionSource = await checkAgainstSchema(actionSource, actionSchema, parsingContext);

    let action: Action;
    switch (actionSource.type) {
        case 'setAttribute':
            action = await ActionSetAttribute.fromSource(parsingContext, actionSource, false);
            break;
        case 'advanceTurn':
            action = await ActionAdvanceTurn.fromSource(parsingContext, actionSource, false);
            break;
        case 'destroyShip':
            action = await ActionDestroyShip.fromSource(parsingContext, actionSource, false);
            break;
        case 'win':
            action = await ActionWin.fromSource(parsingContext, actionSource, false);
            break;
        case 'lose':
            action = await ActionLose.fromSource(parsingContext, actionSource, false);
            break;
        case 'displayMessage':
            action = await ActionDisplayMessage.fromSource(parsingContext, actionSource, false);
    }

    return action;
}
