/**
 * EvaluationError - Server Version
 *
 * Thrown when an error is encountered during evaluation of scenario logic
 */
export class EvaluationError extends Error {
    public constructor(public readonly context: string,
                       message: string) {
        super(message);
        Object.setPrototypeOf(this, EvaluationError.prototype);
    }
}
