import { EventEvaluationState }                                                                        from './event-evaluation-state';
import type { EventInfoEntry }                                                                         from './base-events';
import type { EventContextForEvent, GenericEventContext }                                              from './event-context';
import type { EventListener, EventListeners, GenericQueuedEventListenerCall, QueuedEventListenerCall } from './event-listener';

/**
 * EventRegistrar - Server Version
 *
 * Responsible for keeping track of listeners for events
 */
export class EventRegistrar<T extends Record<S, EventInfoEntry>, S extends string> {

    private _rootRegistrar: EventRegistrar<T, S> = this;
    private _parentRegistrar: EventRegistrar<T, S> | undefined;
    private deactivated = false;

    private preQueuedEventListenerCalls: GenericQueuedEventListenerCall[] = [];
    private queuedEventListenerCalls: GenericQueuedEventListenerCall[] = [];

    private _eventEvaluationState: EventEvaluationState | undefined;
    private _eventEvaluationCompleteCallback: ((listenersProcessed: number, eventEvaluationState: EventEvaluationState) => void) | undefined;

    /**
     * EventRegistrar constructor
     *
     * @param  eventListeners Dictionary of event names to arrays of listener functions
     * @param  subRegistrars  Array of registrars to pass events onto when triggered
     */
    public constructor(private readonly eventListeners: EventListeners<T, S>,
                       private subRegistrars: EventRegistrar<T, S>[]) {

        for (const eventListeners of Object.values(this.eventListeners))
            (eventListeners as EventListener<T, S, S>[]).sort((f, s) => f[0] === s[0] ? f[1] - s[1] : f[0] - s[0]);

        for (const subRegistrar of this.subRegistrars) {
            subRegistrar._parentRegistrar = this;
            subRegistrar.rootRegistrar = this;
        }
    }

    /**
     * Adds a listener for an event
     *
     * @param  event    Event to register listener for
     * @param  listener Event listener
     */
    public addEventListener<X extends S>(event: X, listener: EventListener<T, S, X>): void {
        this.eventListeners[event].push(listener);
        this.eventListeners[event].sort((f, s) => f[0] === s[0] ? f[1] - s[1] : f[0] - s[0]);

        const existingListeners = this.eventListeners[event];
        const newEventListeners: EventListener<T, S, X>[] = [];

        // Add attribute listeners from old array until priority is higher than priority of new attribute listener
        let i = 0;
        while (i < existingListeners.length) {
            const oldEventListener = existingListeners[i++];
            if (oldEventListener[0] > listener[0] || oldEventListener[0] === listener[0] && oldEventListener[1] > listener[1])
                break;
            newEventListeners.push(oldEventListener);
        }

        // Add new attribute listener to new array and add final elements of old array
        newEventListeners.push(listener);
        while (i < existingListeners.length)
            newEventListeners.push(existingListeners[i++]);

        this.eventListeners[event] = newEventListeners;
    }

    /**
     * Adds a registrar to pass events onto when triggered
     *
     * @param  subRegistrar Registrar to pass events onto
     */
    public addSubRegistrar(subRegistrar: EventRegistrar<T, S>): void {
        this.subRegistrars.push(subRegistrar);
        subRegistrar._parentRegistrar = this;
        subRegistrar.rootRegistrar = this._rootRegistrar;
    }

    /**
     * Removes a registrar to no longer pass events onto when triggered
     *
     * @param  subRegistrar Registrar to no longer pass events onto
     */
    public removeSubRegistrar(subRegistrar: EventRegistrar<T, S>): void {
        this.subRegistrars = this.subRegistrars.filter(r => r !== subRegistrar);
        subRegistrar._parentRegistrar = undefined;
        subRegistrar.rootRegistrar = subRegistrar;
    }

    /**
     * Removes this registrar as a sub registrar of its current parent registrar
     */
    public deactivate(): void {
        if (this.deactivated)
            return;
        this.deactivated = true;
        this._parentRegistrar?.removeSubRegistrar(this);
        for (const subRegistrar of this.subRegistrars)
            subRegistrar.deactivate();
    }

    /**
     * Adds an event call to the queue of events to be evaluated
     *
     * Events are always queued on the root registrar
     *
     * @param  event        Event to queue
     * @param  eventContext Context for resolving objects and values when an event is triggered
     */
    public queueEvent<X extends S>(event: X, eventContext: EventContextForEvent<T, S, X>): void {

        // Add event listener calls for this event to the queue
        const newEventListenerCalls: QueuedEventListenerCall<T, S, X>[] = [];
        for (const eventListener of this.eventListeners[event])
            newEventListenerCalls.push([eventListener, eventContext, this]);
        this.queueEventListenerCalls(newEventListenerCalls as GenericQueuedEventListenerCall[]);

        // Merge sub-registrar events into event listener call queue
        for (const subRegistrar of this.subRegistrars)
            subRegistrar.queueEvent(event, eventContext);
    }

    /**
     * Add an event listener call to a queue of event listener calls waiting to be queued
     *
     * @param  eventListener Event listener to call to be pre-queued
     * @param  eventContext  Context for resolving objects and values when an even is triggered
     */
    public preQueueEventListenerCall(eventListener: EventListener<never, never, never>, eventContext: GenericEventContext): void {
        this._rootRegistrar.preQueuedEventListenerCalls.push([eventListener, eventContext, this as EventRegistrar<any, string>]);
    }

    /**
     * Moves pre-queued event listener calls to the main event listener call queue
     */
    private queuePreQueuedEventListenerCalls(): void {
        this._rootRegistrar.preQueuedEventListenerCalls.sort((f, s) => f[0][0] === s[0][0] ? f[0][1] - s[0][1] : f[0][0] - s[0][0]);
        this._rootRegistrar.queueEventListenerCalls(this.preQueuedEventListenerCalls);
        this._rootRegistrar.preQueuedEventListenerCalls = [];
    }

    /**
     * Adds an array of event listener calls to existing event listener call queue
     *
     * @param  newEventListenerCalls Array of new listener calls to add
     */
    public queueEventListenerCalls(newEventListenerCalls: GenericQueuedEventListenerCall[]): void {
        if (newEventListenerCalls.length === 0)
            return;

        // Merge new event listener calls into existing queue, sorted by ascending priority
        const newQueue: GenericQueuedEventListenerCall[] = [];
        let i = 0, j = 0;
        while (i < this._rootRegistrar.queuedEventListenerCalls.length && j < newEventListenerCalls.length) {
            const left = this._rootRegistrar.queuedEventListenerCalls[i];
            const right = newEventListenerCalls[j];

            // Compare primary priority
            if (left[0][0] < right[0][0]) {
                newQueue.push(left);
                i++;
            } else if (left[0][0] > right[0][0]) {
                newQueue.push(right);
                j++;

                // Compare secondary priority
            } else if (left[0][1] <= right[0][1]){
                newQueue.push(left);
                i++;
            } else {
                newQueue.push(right);
                j++;
            }
        }
        while (i < this._rootRegistrar.queuedEventListenerCalls.length)
            newQueue.push(this._rootRegistrar.queuedEventListenerCalls[i++]);
        while (j < newEventListenerCalls.length)
            newQueue.push(newEventListenerCalls[j++]);
        this._rootRegistrar.queuedEventListenerCalls = newQueue;
    }

    /**
     * Triggers the start of event evaluation on the existing event listener call queue if it has not started already
     */
    public evaluateEvents(): void {

        // Always execute on the root registrar
        if (this !== this._rootRegistrar) {
            this._rootRegistrar.evaluateEvents();
            return;
        }

        // Create a new evaluation state if one does not exist for this queue
        if (this._eventEvaluationState !== undefined)
            return;
        const eventEvaluationState = new EventEvaluationState();
        this._eventEvaluationState = eventEvaluationState;

        // Process queue - More listeners may be added to queue during evaluation
        let listenersProcessed = 0;
        while (this.queuedEventListenerCalls.length > 0) {
            const [eventListener, eventContext, eventRegistrar] = this.queuedEventListenerCalls.pop()!;

            if (eventRegistrar.deactivated)
                continue;
            if (eventEvaluationState.terminate)
                return;
            eventListener[2](eventEvaluationState, eventContext);
            listenersProcessed++;
            if (this.preQueuedEventListenerCalls.length > 0)
                this.queuePreQueuedEventListenerCalls();
        }

        if (eventEvaluationState.terminate)
            return;

        // Finish evaluation
        this._eventEvaluationState = undefined;
        this.onEventEvaluationComplete(listenersProcessed, eventEvaluationState);
    }

    /**
     * Called when an event evaluation has completed. Called immediately after completion.
     *
     * @param  listenersProcessed   Number of listeners which were processed during the evaluation
     * @param  eventEvaluationState Finishing event evaluation state
     */
    private onEventEvaluationComplete(listenersProcessed: number, eventEvaluationState: EventEvaluationState): void {
        this._eventEvaluationCompleteCallback?.(listenersProcessed, eventEvaluationState);
        for (const subRegistrar of this.subRegistrars)
            subRegistrar.onEventEvaluationComplete(listenersProcessed, eventEvaluationState);
    }

    /**
     * Getters and setters
     */

    public get rootRegistrar(): EventRegistrar<T, S> {
        return this._rootRegistrar;
    }

    private set rootRegistrar(registrar: EventRegistrar<T, S>) {
        this._rootRegistrar = registrar;
        for (const subRegistrar of this.subRegistrars)
            subRegistrar.rootRegistrar = registrar;
    }

    public get parentRegistrar(): EventRegistrar<T, S> | undefined {
        return this._parentRegistrar;
    }

    public get eventEvaluationState(): EventEvaluationState | undefined {
        return this._eventEvaluationState;
    }

    public set eventEvaluationCompleteCallback(callback: (listenersProcessed: number, eventEvaluationState: EventEvaluationState) => void) {
        this._eventEvaluationCompleteCallback = callback;
    }
}
