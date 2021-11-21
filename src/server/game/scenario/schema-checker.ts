import Joi                     from 'joi';
import { UnpackingError }      from './unpacker';
import type { ParsingContext } from './parsing-context';

/**
 * Validate JSON source data against a schema
 *
 * @param    source         JSON source data
 * @param    schema         Schema to validate source against
 * @param    parsingContext Context for resolving scenario data
 * @returns                 Sanitised JSON data
 */
export async function checkAgainstSchema<T>(source: T, schema: Joi.Schema, parsingContext: ParsingContext): Promise<T> {

    // Validate JSON data against schema
    try {
        source = await schema.validateAsync(source);
    } catch (e: unknown) {
        if (e instanceof Joi.ValidationError)
            throw UnpackingError.fromJoiValidationError(e, parsingContext);
        throw e;
    }

    // Return
    return source;
}
