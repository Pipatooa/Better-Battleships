import { EventEvaluationState }                                                                        from './event-evaluation-state';
import type { EventInfoEntry }                                                                         from './base-events';
import type { EventContextForEvent }                                                                   from './event-context';
import type { EventListener, EventListeners, GenericQueuedEventListenerCall, QueuedEventListenerCall } from './event-listener';

/**
 * EventRegistrar - Server Version
 *
 * Responsible for keeping track of listeners for events
 */
export class EventRegistrar<T extends Record<S, EventInfoEntry>, S extends string> {

    private _rootRegistrar: EventRegistrar<T, S> = this;
    private parentRegistrar: EventRegistrar<T, S> | undefined;
    private deactivated = false;

    private queuedEventListenerCalls: GenericQueuedEventListenerCall[] = [];
    private eventEvaluationState: EventEvaluationState | undefined;
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
            subRegistrar.parentRegistrar = this;
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
    }

    /**
     * Adds a registrar to pass events onto when triggered
     *
     * @param  subRegistrar Registrar to pass events onto
     */
    public addSubRegistrar(subRegistrar: EventRegistrar<T, S>): void {
        this.subRegistrars.push(subRegistrar);
        subRegistrar.parentRegistrar = this;
        subRegistrar.rootRegistrar = this._rootRegistrar;
    }

    /**
     * Removes a registrar to no longer pass events onto when triggered
     *
     * @param  subRegistrar Registrar to no longer pass events onto
     */
    public removeSubRegistrar(subRegistrar: EventRegistrar<T, S>): void {
        this.subRegistrars = this.subRegistrars.filter(r => r !== subRegistrar);
        subRegistrar.parentRegistrar = undefined;
        subRegistrar.rootRegistrar = subRegistrar;
    }

    /**
     * Removes this registrar as a sub registrar of its current parent registrar
     */
    public deactivate(): void {
        if (this.deactivated)
            return;
        this.deactivated = true;
        this.parentRegistrar?.removeSubRegistrar(this);
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

        // Create array describing new event listener calls to be added to queue
        const newEventListenerCalls: QueuedEventListenerCall<T, S, X>[] = [];
        for (const eventListener of this.eventListeners[event])
            newEventListenerCalls.push([eventListener, eventContext, this]);

        // Merge new event listener calls into existing queue, sorted by ascending priority
        const newQueue: GenericQueuedEventListenerCall[] = [];
        let i = 0, j = 0;
        while (i < this._rootRegistrar.queuedEventListenerCalls.length && j < newEventListenerCalls.length) {
            const left = this._rootRegistrar.queuedEventListenerCalls[i];
            const right = newEventListenerCalls[j] as GenericQueuedEventListenerCall;

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
            newQueue.push(newEventListenerCalls[j++] as GenericQueuedEventListenerCall);
        this._rootRegistrar.queuedEventListenerCalls = newQueue;

        // Merge sub-registrar events into event listener call queue
        for (const subRegistrar of this.subRegistrars)
            subRegistrar.queueEvent(event, eventContext);
    }

    /**
     * Triggers the start of event evaluation on the existing event listener call queue if it has not started already
     */
    public evaluateEvents(): void {

        // Create a new evaluation state if one does not exist for this queue
        if (this._rootRegistrar.eventEvaluationState !== undefined)
            return;
        const eventEvaluationState = new EventEvaluationState();
        this._rootRegistrar.eventEvaluationState = eventEvaluationState;

        // Process queue - More listeners may be added to queue during evaluation
        let listenersProcessed = 0;
        while (this._rootRegistrar.queuedEventListenerCalls.length > 0) {
            const [eventListener, eventContext, eventRegistrar] = this._rootRegistrar.queuedEventListenerCalls.pop()!;
            if (eventRegistrar.deactivated)
                continue;
            eventListener[2](eventEvaluationState, eventContext);
            listenersProcessed++;
        }

        // Finish evaluation
        this._rootRegistrar.eventEvaluationState = undefined;
        this._rootRegistrar.onEventEvaluationComplete(listenersProcessed, eventEvaluationState);
    }

    /**
     * Called when an event evaluation has completed
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

    public set eventEvaluationCompleteCallback(callback: (listenersProcessed: number, eventEvaluationState: EventEvaluationState) => void) {
        this._eventEvaluationCompleteCallback = callback;
    }
}
