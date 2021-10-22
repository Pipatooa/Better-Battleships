import { ParsingContext } from '../parsing-context';
import { checkAgainstSchema } from '../schema-checker';
import { EmptyValueConstraint } from './empty-value-constraint';
import { ValueAtLeastConstraint } from './value-at-least-constraint';
import { ValueAtMostConstraint } from './value-at-most-constraint';
import { IValueConstraintSource, ValueConstraint, valueConstraintSchema } from './value-constaint';
import { ValueEqualConstraint } from './value-equal-constraint';
import { ValueInRangeConstraint } from './value-in-range-constraint';

/**
 * Factory function to generate ValueConstraint from JSON scenario data
 *
 * @param    parsingContext        Context for resolving scenario data
 * @param    valueConstraintSource JSON data for ValueConstraint
 * @param    checkSchema           When true, validates source JSON data against schema
 * @returns                        Created ValueConstraint object
 */
export async function buildValueConstraint(parsingContext: ParsingContext, valueConstraintSource: IValueConstraintSource, checkSchema: boolean): Promise<ValueConstraint> {

    // Validate JSON data against schema
    if (checkSchema)
        valueConstraintSource = await checkAgainstSchema(valueConstraintSource, valueConstraintSchema, parsingContext);

    let valueConstraint: ValueConstraint | undefined;

    // Create EmptyValueConstraint if object is empty
    if (Object.keys(valueConstraintSource).length === 0)
        valueConstraint = new EmptyValueConstraint();

    // Create ValueEqualConstraint
    else if ('exactly' in valueConstraintSource)
        valueConstraint = await ValueEqualConstraint.fromSource(parsingContext, valueConstraintSource, false);

    // Create ValueInRangeConstraint
    else if ('min' in valueConstraintSource && 'max' in valueConstraintSource)
        valueConstraint = await ValueInRangeConstraint.fromSource(parsingContext, valueConstraintSource, false);

    // Create ValueAtLeastConstraint
    else if ('min' in valueConstraintSource)
        valueConstraint = await ValueAtLeastConstraint.fromSource(parsingContext, valueConstraintSource, false);

    // Create ValueAtMostConstraint
    else
        valueConstraint = await ValueAtMostConstraint.fromSource(parsingContext, valueConstraintSource, false);

    // Return created ValueConstraint object
    return valueConstraint;
}
