import { buildAction }         from './action-builder';
import type { ParsingContext } from '../../parsing-context';
import type { Action }         from './action';
import type { ActionSource }   from './sources/action';

/**
 * Gets a dictionary of actions tied to events from a dictionary of action sources
 *
 * @param    parsingContext Context for resolving scenario data
 * @param    eventNames     All event names for which actions can be registered
 * @param    foreignEvents  Event names for which attribute references refer to foreign attributes
 * @param    actionData     JSON data for actions
 * @returns                 Created dictionary of actions tied to events
 */
export async function getActions<T extends { [event in U]: ActionSource[] }, U extends string>(parsingContext: ParsingContext, eventNames: readonly U[], foreignEvents: readonly Partial<U>[], actionData: T): Promise<{ [event in U]: Action[] }> {

    // Populate dictionary with empty arrays for all event names
    const actions = {} as { [event in U]: Action[] };
    for (const event of eventNames) {
        actions[event] = [];
    }

    // Populate event arrays with created actions
    for (const entry of Object.entries(actionData)) {
        const [event, actionSources] = entry as [U, ActionSource[]];

        // If event is a foreign event, set foreign attribute flag for parsing context
        parsingContext.foreignAttributeFlag = foreignEvents.includes(event);

        for (let i = 0; i < actionSources.length; i++) {
            const actionSource = actionSources[i];
            const action: Action = await buildAction(parsingContext.withExtendedPath(`.${event}[${i}]`), actionSource, false);
            parsingContext.reducePath();
            actions[event].push(action);
        }
    }

    parsingContext.foreignAttributeFlag = false;
    return actions;
}
