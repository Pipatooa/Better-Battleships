/**
 * TimeoutManager - Shared
 *
 * Handles timeout functions, allowing for easy starting and stopping of timeouts with default durations
 */
export class TimeoutManager<T extends { [name: string]: [() => any, number, boolean] }> {

    /**
     * Internal timeout dictionary
     *
     * Entries follow format [timeoutFunction, defaultDuration, isInterval, timeoutID]
     */
    protected readonly timeouts: Record<keyof T, [() => any, number, boolean, NodeJS.Timeout | undefined]>;

    /**
     * TimeoutManager constructor
     * @param timeouts Dictionary of string (name) indexed timeout information in the format
     *                 [timeoutFunction, defaultDuration, isInterval]
     */
    public constructor(timeouts: T) {

        // Copy timeout information to internal dictionary of timeout information
        // This copy is done to separate types T and Record<keyof T, [...]>
        this.timeouts = timeouts as any;
    }

    /**
     * Starts or restarts a timeout with name
     * @param name Name of timeout
     * @param duration Optional duration of timeout to override default
     */
    public startTimeout(name: keyof T, duration?: number) {

        // Get internal dictionary entry for timeout
        let [timeoutFunction, defaultDuration, isInterval, timeoutID] = this.timeouts[name];

        // If timeout has already started, stop it
        if (timeoutID !== undefined)
            this.stopTimeout(name);

        // Select appropriate timeout set function
        let timeoutSetFunction = isInterval ? setInterval : setTimeout;

        // Start timeout with default duration if specified. Otherwise, use default duration
        // Also stores timeout ID of started timeout
        this.timeouts[name][3] = timeoutSetFunction(timeoutFunction, duration ?? defaultDuration);
    }

    /**
     * Stops a timeout with name
     * @param name Name of timeout
     */
    public stopTimeout(name: keyof T) {

        // Get internal dictionary entry for timeout
        let [timeoutFunction, defaultDuration, isInterval, timeoutID] = this.timeouts[name];

        // Select appropriate timeout clear function
        let timeoutClearFunction = isInterval ? clearInterval : clearTimeout;

        // If timeout ID is not undefined, clear timeout
        if (timeoutID !== undefined)
            timeoutClearFunction(timeoutID);

        // Set timeout ID to undefined
        this.timeouts[name][3] = undefined;
    }

    /**
     * Checks if a timeout is running
     * @param name Name of timeout
     * @returns boolean Whether the timeout is running
     */
    public isTimeoutRunning(name: keyof T): boolean {
        return this.timeouts[name][2] !== undefined;
    }

    /**
     * Sets a new timeout function for a timeout name
     *
     * Automatically stops existing timeout
     * @param name Name of timeout
     * @param timeoutFunction New timeout function to use
     * @param duration Optional new default duration of timeout
     * @param isInterval Whether this function is an interval function
     * @param restart Whether to start timeout again if timeout was already running
     */
    public setTimeoutFunction(name: keyof T, timeoutFunction: () => any, duration: number, isInterval: boolean, restart?: boolean) {

        // Get existing timeout
        let [oldTimeoutFunction, oldDefaultDuration, oldIsInterval, oldTimeoutID] = this.timeouts[name];

        // Stops existing timeout
        this.stopTimeout(name);

        // Set new timeout entry
        this.timeouts[name] = [timeoutFunction, duration ?? oldDefaultDuration, isInterval, undefined];

        // If old timeout was running, optionally restart
        if (restart && oldTimeoutID !== undefined)
            this.startTimeout(name);
    }
}
