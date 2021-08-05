import {IValueEqualConstraintSource, ValueEqualConstraint} from "./value-equal-constraint";
import {
    IValueInRangeConstraintSource,
    ValueInRangeConstraint,
} from "./value-in-range-constraint";
import {
    IValueAtLeastConstraintSource,
    ValueAtLeastConstraint,
} from "./value-at-least-constraint";
import {
    IValueAtMostConstraintSource,
    ValueAtMostConstraint,
} from "./value-at-most-constraint";
import {ValueConstraint} from "./value-constaint";
import Joi from "joi";
import {UnpackingError} from "../unpacker";
import {EmptyValueConstraint} from "./empty-value-constraint";

/**
 * Factory function to generate value constraint from JSON scenario data
 * @param valueConstraintSource - JSON data for value constraint
 * @returns valueConstraint -- Created ValueConstraint object
 */
export async function buildValueConstraint(valueConstraintSource: IValueConstraintSource): Promise<ValueConstraint> {

    // Validate JSON data against schema
    try {
        await valueConstraintSchema.validateAsync(valueConstraintSource);
    }
    catch (e) {
        console.log(JSON.stringify(e));
        if (e instanceof Joi.ValidationError)
            throw UnpackingError.fromJoiValidationError(e);
    }

    let valueConstraint: ValueConstraint | undefined;

    // Try creating empty value constraint
    if (Object.keys(valueConstraintSource).length == 0)
        valueConstraint = new EmptyValueConstraint();

    // Try creating value equal constraint
    else if (await ValueEqualConstraint.checkSource(valueConstraintSource as IValueEqualConstraintSource))
        valueConstraint = await ValueEqualConstraint.fromSource(valueConstraintSource as IValueEqualConstraintSource);

    // Try creating value in range constraint
    else if (await ValueInRangeConstraint.checkSource(valueConstraintSource as IValueInRangeConstraintSource))
        valueConstraint = await ValueInRangeConstraint.fromSource(valueConstraintSource as IValueInRangeConstraintSource);

    // Try creating value at least constraint
    else if (await ValueAtLeastConstraint.checkSource(valueConstraintSource as IValueAtLeastConstraintSource))
        valueConstraint = await ValueAtLeastConstraint.fromSource(valueConstraintSource as IValueAtLeastConstraintSource);

    // Try creating value at most constraint
    else
        valueConstraint = await ValueAtMostConstraint.fromSource(valueConstraintSource as IValueAtMostConstraintSource);

    return valueConstraint;
}

/**
 * Value constraint interface reflecting scenario schema
 */
export type IValueConstraintSource =
    IValueEqualConstraintSource |
    IValueInRangeConstraintSource |
    IValueAtLeastConstraintSource |
    IValueAtMostConstraintSource;

/**
 * Schema for validating source JSON data
 */
export const valueConstraintSchema = Joi.object({
    exactly: Joi.number(),
    min: Joi.number(),
    max: Joi.number().min(Joi.ref('min'))
}).without('exactly', ['min', 'max']);
