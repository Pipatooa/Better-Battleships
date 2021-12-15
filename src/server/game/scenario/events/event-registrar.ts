import type { EventInfoEntry }                       from './base-events';
import type { EventContextForEvent, EventListeners } from './event-context';

/**
 * EventRegistrar - Server Version
 *
 * Responsible for keeping track of listeners for events
 */
export class EventRegistrar<T extends Record<S, EventInfoEntry>, S extends string> {

    private parentRegistrar: EventRegistrar<T, S> | undefined;

    /**
     * EventRegistrar constructor
     *
     * @param  eventListeners Dictionary of event names to arrays of listener functions
     * @param  subRegistrars  Array of registrars to pass events onto when triggered
     */
    public constructor(private readonly eventListeners: EventListeners<T, S>,
                       private readonly subRegistrars: EventRegistrar<T, S>[]) {
        
        for (const subRegistrar of subRegistrars)
            subRegistrar.parentRegistrar = this;
    }

    /**
     * Adds a listener for an event
     *
     * @param  event      Event name
     * @param  listener   Listener function
     * @param  prioritise Whether to put event listener at start of event listener array
     */
    public addEventListener<X extends S>(event: X, listener: (eventContext: EventContextForEvent<T, S, X>) => void, prioritise: boolean): void {
        if (prioritise)
            this.eventListeners[event].unshift(listener);
        else
            this.eventListeners[event].push(listener);
    }

    /**
     * Adds a registrar to pass events onto when triggered
     *
     * @param  subRegistrar Registrar to pass events onto
     */
    public addSubRegistrar(subRegistrar: EventRegistrar<T, S>): void {
        this.subRegistrars.push(subRegistrar);
        subRegistrar.parentRegistrar = this;
    }

    /**
     * Calls all listener functions for an event
     *
     * @param  event        Event name
     * @param  eventContext Context for resolving objects and values when an event is triggered
     */
    public triggerEvent<X extends S>(event: X, eventContext: EventContextForEvent<T, S, X>): void {
        for (const listener of this.eventListeners[event]) {
            console.log(`${event}: Called gaming ${listener}`);
            listener(eventContext);
        }
        for (const subRegistrar of this.subRegistrars)
            subRegistrar.triggerEvent(event, eventContext);
    }

    /**
     * Triggers event on the topmost parent event registrar
     *
     * @param  event        Event name
     * @param  eventContext Context for resolving objects and values when an event is triggered
     */
    public triggerEventFromRoot<X extends S>(event: X, eventContext: EventContextForEvent<T, S, X>): void {
        let registrar: EventRegistrar<T, S> = this.parentRegistrar!;
        while (registrar.parentRegistrar !== undefined) {
            registrar = registrar.parentRegistrar;
        }
        registrar.triggerEvent(event, eventContext);
    }
}
