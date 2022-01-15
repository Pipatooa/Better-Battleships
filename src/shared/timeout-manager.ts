/**
 * TimeoutManager - Shared
 *
 * Handles timeout functions, allowing for easy starting and stopping of timeouts with default durations
 */
export class TimeoutManager<K extends string> {

    private disabled = false;

    /**
     * Internal timeout dictionary
     *
     * Entries follow format [timeoutFunction, defaultDuration, isInterval, timeoutID]
     */
    protected readonly timeouts: Record<K, [() => any, number, boolean, NodeJS.Timeout | undefined]>;

    /**
     * TimeoutManager constructor
     *
     * @param  timeouts Dictionary of string (name) indexed timeout information in the format
     *                  [timeoutFunction, defaultDuration, isInterval]
     */
    public constructor(timeouts: Record<K, [() => any, number, boolean]>) {

        // Copy timeout information to internal dictionary of timeout information
        this.timeouts = timeouts as any;
    }

    /**
     * Starts or restarts a timeout with name
     *
     * @param  name     Name of timeout
     * @param  duration Optional duration of timeout to override default
     */
    public startTimeout(name: K, duration?: number): void {
        if (this.disabled)
            return;

        // Get internal dictionary entry for timeout
        const [ timeoutFunction, defaultDuration, isInterval, timeoutID ] = this.timeouts[name];

        // If timeout has already started, stop it
        if (timeoutID !== undefined)
            this.stopTimeout(name);

        // Select appropriate timeout set function
        const timeoutSetFunction = isInterval ? setInterval : setTimeout;

        // Start timeout with default duration if specified. Otherwise, use default duration
        // Also stores timeout ID of started timeout
        this.timeouts[name][3] = timeoutSetFunction(timeoutFunction, duration ?? defaultDuration);
    }

    /**
     * Stops a timeout with name
     *
     * @param  name Name of timeout
     */
    public stopTimeout(name: K): void {

        // Get internal dictionary entry for timeout
        const [ , , isInterval, timeoutID ] = this.timeouts[name];

        // Select appropriate timeout clear function
        const timeoutClearFunction = isInterval ? clearInterval : clearTimeout;

        // If timeout ID is not undefined, clear timeout
        if (timeoutID !== undefined)
            timeoutClearFunction(timeoutID);

        // Set timeout ID to undefined
        this.timeouts[name][3] = undefined;
    }

    /**
     * Checks if a timeout is running
     *
     * @param    name Name of timeout
     * @returns       Whether the timeout is running
     */
    public isTimeoutRunning(name: K): boolean {
        return this.timeouts[name][2] !== undefined;
    }

    /**
     * Sets a new timeout function for a timeout name
     *
     * Automatically stops existing timeout
     *
     * @param  name            Name of timeout
     * @param  timeoutFunction New timeout function to use
     * @param  duration        Optional new default duration of timeout
     * @param  isInterval      Whether this function is an interval function
     * @param  restart         Whether to start timeout again if timeout was already running
     */
    public setTimeoutFunction(name: K, timeoutFunction: () => any, duration: number | undefined, isInterval: boolean, restart?: boolean): void {

        // Get existing timeout
        const [ , oldDefaultDuration, , oldTimeoutID ] = this.timeouts[name];

        // Stops existing timeout
        this.stopTimeout(name);

        // Set new timeout entry
        this.timeouts[name] = [ timeoutFunction, duration ?? oldDefaultDuration, isInterval, undefined ];

        // If old timeout was running, optionally restart
        if (restart !== undefined && restart && oldTimeoutID !== undefined)
            this.startTimeout(name);
    }

    /**
     * Disables this timeout manager, stopping all timeouts and prevent timeouts from starting again
     */
    public disable(): void {
        this.disabled = true;
        for (const timeoutName of Object.keys(this.timeouts))
            this.stopTimeout(timeoutName as K);
    }
}
