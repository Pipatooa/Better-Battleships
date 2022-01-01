import { ParsingContext } from '../parsing-context';
import type Joi           from 'joi';

/**
 * UnpackingError - Server Version
 *
 * Thrown when an error is encountered during the scenario unpacking process
 */
export class UnpackingError extends Error {
    public readonly context: string;

    public constructor(message: string, context: string | ParsingContext) {
        super(message);

        if (context instanceof ParsingContext)
            this.context = `An error occurred whilst parsing '${context.currentFile}'`;
        else
            this.context = `An error occurred whilst parsing '${context}'`;

        Object.setPrototypeOf(this, UnpackingError.prototype);
    }

    /**
     * Factory function to generate UnpackingError based on `Joi.ValidationError`
     *
     * Useful for Joi validation
     *
     * @param    err            Joi validation error
     * @param    parsingContext Parsing context to use for context
     * @returns                 Created UnpackingError
     */
    public static fromJoiValidationError(err: Joi.ValidationError, parsingContext: ParsingContext): UnpackingError {
        return new UnpackingError(err.message.toString(), parsingContext);
    }
}
