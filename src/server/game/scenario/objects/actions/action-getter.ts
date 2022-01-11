import { EventListenerPrimaryPriority }                   from '../../events/event-listener';
import { buildAction }                                    from './action-builder';
import type { EventInfoEntry }                            from '../../events/base-events';
import type { EventContextForEvent, GenericEventContext } from '../../events/event-context';
import type { EventEvaluationState }                      from '../../events/event-evaluation-state';
import type { EventListeners }                            from '../../events/event-listener';
import type { ParsingContext }                            from '../../parsing-context';
import type { Action }                                    from './action';
import type { ActionSource }                              from './sources/action';

/**
 * Gets a dictionary of event listeners for actions tied to events from a dictionary of action sources
 *
 * @param    parsingContext Context for resolving scenario data
 * @param    eventInfo      Record describing a set of events
 * @param    actionData     JSON data for actions
 * @returns                 Created event listener dictionary
 */
export async function getEventListenersFromActionSource
    <T extends Record<S, EventInfoEntry>, S extends string>(
    parsingContext: ParsingContext, eventInfo: T, actionData: { [event in S]?: ActionSource[] }
): Promise<EventListeners<T, S>> {

    // Get actions for each event
    const actions = await getActionsFromSource(parsingContext, eventInfo, actionData);

    // Create event listeners for each action for each event
    const eventListeners = {} as EventListeners<T, S>;
    for (const entry of Object.entries(actions)) {
        const [eventName, eventActions] = entry as [S, Action[]];
        eventListeners[eventName] = [];

        // Convert actions to event listeners
        for (const action of eventActions) {
            const listenerCallback = (eventEvaluationState: EventEvaluationState, eventContext: EventContextForEvent<T, S, any>): void =>
                action.execute(eventEvaluationState, eventContext as GenericEventContext);
            eventListeners[eventName].push([EventListenerPrimaryPriority.ActionDefault, action.priority, listenerCallback]);
        }
    }

    return eventListeners;
}

/**
 * Gets a dictionary of events to actions from a dictionary of action sources
 *
 * @param    parsingContext Context for resolving scenario data
 * @param    eventInfo      Record describing a set of events
 * @param    actionData     JSON data for actions
 * @returns                 Created array of actions
 */
export async function getActionsFromSource
    <T extends Record<S, EventInfoEntry>, S extends string>(
    parsingContext: ParsingContext, eventInfo: T, actionData: { [event in S]?: ActionSource[] }
): Promise<Record<S, Action[]>> {

    // Populate event arrays with created actions
    const actions = {} as Record<S, Action[]>;
    for (const entry of Object.entries(eventInfo)) {
        const [eventName, eventInfo] = entry as [S, EventInfoEntry];
        const actionSources = actionData[eventName];

        if (actionSources === undefined)
            continue;

        parsingContext.currentEventInfo = eventInfo;

        // Get actions for this event
        const eventActions: Action[] = [];
        for (let i = 0; i < actionSources.length; i++) {
            const actionSource = actionSources[i];
            const action = await buildAction(parsingContext.withExtendedPath(`.${eventName}[${i}]`), actionSource, false);
            parsingContext.reducePath();
            eventActions.push(action);
        }

        actions[eventName] = eventActions;
    }

    parsingContext.currentEventInfo = undefined;
    return actions;
}
