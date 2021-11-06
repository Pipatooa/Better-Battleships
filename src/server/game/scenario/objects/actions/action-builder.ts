import type { ParsingContext } from '../../parsing-context';
import { checkAgainstSchema } from '../../schema-checker';
import type { Action } from './action';
import { ActionAdvanceTurn } from './action-advance-turn';
import { ActionSetAttribute } from './action-set-attribute';
import { ActionWin } from './action-win';
import type { ActionSource } from './sources/action';
import { actionSchema } from './sources/action';

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
        case 'win':
            action = await ActionWin.fromSource(parsingContext, actionSource, false);
            break;
    }
    
    return action;
}
