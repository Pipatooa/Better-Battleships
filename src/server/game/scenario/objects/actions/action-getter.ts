import { EventListenerPrimaryPriority }                   from '../../events/event-listener';
import { buildAction }                                    from './action-builder';
import type { EventInfoEntry }                            from '../../events/base-events';
import type { EventContextForEvent, GenericEventContext } from '../../events/event-context';
import type { EventEvaluationState }                      from '../../events/event-evaluation-state';
import type { EventListeners }                            from '../../events/event-listener';
import type { ParsingContext }                            from '../../parsing-context';
import type { ActionSource }                              from './sources/action';

/**
 * Gets a dictionary of event listeners for actions tied to events from a dictionary of action sources
 *
 * @param    parsingContext     Context for resolving scenario data
 * @param    eventAttributeInfo Record describing attributes available for event names
 * @param    actionData         JSON data for actions
 * @returns                     Created event listener dictionary
 */
export async function eventListenersFromActionSource<T extends Record<S, EventInfoEntry>, S extends string>(parsingContext: ParsingContext, eventAttributeInfo: T, actionData: { [event in S]?: ActionSource[] }): Promise<EventListeners<T, S>> {

    // Populate event arrays with created actions
    const eventListeners = {} as EventListeners<T, S>;
    for (const entry of Object.entries(eventAttributeInfo)) {
        const [eventName, eventInfo] = entry as [S, EventInfoEntry];
        const actionSources = actionData[eventName];
        eventListeners[eventName] = [];

        if (actionSources === undefined)
            continue;

        parsingContext.currentEventInfo = eventInfo;

        for (let i = 0; i < actionSources.length; i++) {
            const actionSource = actionSources[i];
            const action = await buildAction(parsingContext.withExtendedPath(`.${eventName}[${i}]`), actionSource, false);
            parsingContext.reducePath();
            const listenerCallback = (eventEvaluationState: EventEvaluationState, eventContext: EventContextForEvent<T, S, S>): void =>
                action.execute(eventEvaluationState, eventContext as unknown as GenericEventContext);
            eventListeners[eventName].push([EventListenerPrimaryPriority.ActionDefault, action.priority, listenerCallback]);
        }
    }

    parsingContext.currentEventInfo = undefined;
    return eventListeners;
}
