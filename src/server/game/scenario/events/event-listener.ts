import type { EventInfoEntry }       from './base-events';
import type { EventContextForEvent } from './event-context';
import type { EventEvaluationState } from './event-evaluation-state';
import type { EventRegistrar }       from './event-registrar';

/**
 * Enum describing possible priorities of different event listeners
 */
export const enum EventListenerPrimaryPriority {
    PreAction = 1,
    ActionDefault = 0,
    PostAction = -1
}

/**
 * Type matching an event listener callback
 */
export type EventListenerCallback<T extends Record<S, EventInfoEntry>, S extends string, X extends S>
    = (eventEvaluationState: EventEvaluationState, eventContext: EventContextForEvent<T, S, X>) => void;

/**
 * Type matching a single event listener callback with a priority
 */
export type EventListener<T extends Record<S, EventInfoEntry>, S extends string, X extends S>
    = [ EventListenerPrimaryPriority, number, EventListenerCallback<T, S, X> ];

/**
 * Type matching a dictionary of event names to arrays of event listeners
 */
export type EventListeners<T extends Record<S, EventInfoEntry>, S extends string>
    = { [X in S]: EventListener<T, S, X>[] };

/**
 * Type matching a queued event listener call
 */
export type QueuedEventListenerCall<T extends Record<S, EventInfoEntry>, S extends string, X extends S>
    = [ EventListener<T, S, X>, EventContextForEvent<T, S, X>, EventRegistrar<T, S> ];

/**
 * Type matching a queued event listener call for a generic event
 */
export type GenericQueuedEventListenerCall
    = QueuedEventListenerCall<any, string, string>;
