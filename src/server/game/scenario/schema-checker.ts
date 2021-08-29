import Joi from 'joi';
import { ParsingContext } from './parsing-context';
import { UnpackingError } from './unpacker';

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

/**
 * Decorator to validate JSON source data against a schema before passing source to function
 *
 * @class
 */
export function WithSchema() {
    return function (target: IScenarioObject, key: string, descriptor: PropertyDescriptor): any {
        const original = descriptor.value;

        descriptor.value = async function (parsingContext: ParsingContext,
                                           source: any,
                                           checkSchema: boolean) {

            // Validate JSON data against schema
            if (checkSchema)
                source = await checkAgainstSchema(source, target.schema, parsingContext);

            // Pass validated JSON
            return original.apply(this, [ parsingContext, source, checkSchema ]);
        };
    };
}

interface IScenarioObject {
    schema: Joi.Schema;
}
