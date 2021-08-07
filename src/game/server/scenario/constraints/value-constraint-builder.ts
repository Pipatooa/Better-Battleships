import Joi from 'joi';
import {UnpackingError} from '../unpacker';
import {EmptyValueConstraint} from './empty-value-constraint';
import {ValueAtLeastConstraint} from './value-at-least-constraint';
import {ValueAtMostConstraint} from './value-at-most-constraint';
import {IValueConstraintSource, ValueConstraint, valueConstraintSchema} from './value-constaint';
import {ValueEqualConstraint} from './value-equal-constraint';
import {ValueInRangeConstraint} from './value-in-range-constraint';

/**
 * Factory function to generate value constraint from JSON scenario data
 * @param valueConstraintSource JSON data for value constraint
 * @param skipSchemaCheck When true, skips schema validation step
 * @returns valueConstraint -- Created ValueConstraint object
 */
export async function buildValueConstraint(valueConstraintSource: IValueConstraintSource, skipSchemaCheck: boolean = false): Promise<ValueConstraint> {

    // Validate JSON data against schema
    if (!skipSchemaCheck) {
        try {
            await valueConstraintSchema.validateAsync(valueConstraintSource);
        } catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
            throw e;
        }
    }

    let valueConstraint: ValueConstraint | undefined;

    // Create EmptyValueConstraint if object is empty
    if (Object.keys(valueConstraintSource).length == 0)
        valueConstraint = new EmptyValueConstraint();

    // Create ValueEqualConstraint
    else if ('exactly' in valueConstraintSource)
        valueConstraint = await ValueEqualConstraint.fromSource(valueConstraintSource, true);

    // Create ValueInRangeConstraint
    else if ('min' in valueConstraintSource && 'max' in valueConstraintSource)
        valueConstraint = await ValueInRangeConstraint.fromSource(valueConstraintSource, true);

    // Create ValueAtLeastConstraint
    else if ('min' in valueConstraintSource)
        valueConstraint = await ValueAtLeastConstraint.fromSource(valueConstraintSource, true);

    // Create ValueAtMostConstraint
    else
        valueConstraint = await ValueAtMostConstraint.fromSource(valueConstraintSource, true);

    return valueConstraint;
}

