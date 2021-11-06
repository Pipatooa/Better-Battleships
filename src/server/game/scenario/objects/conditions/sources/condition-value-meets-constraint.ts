import type { IValueConstraintSource } from '../../constraints/sources/value-constraint';
import { valueConstraintSchema } from '../../constraints/sources/value-constraint';
import type { ValueSource } from '../../values/sources/value';
import { valueSchema } from '../../values/sources/value';
import type { IBaseConditionSource } from './base-condition';
import { baseConditionSchema } from './base-condition';

/**
 * JSON source interface reflecting schema
 */
export interface IConditionValueMeetsConstraintSource extends IBaseConditionSource {
    type: 'valueMeetsConstraint';
    value: ValueSource;
    constraint: IValueConstraintSource;
}

/**
 * Schema for validating source JSON data
 */
export const conditionValueMeetsConstraintSchema = baseConditionSchema.keys({
    type: 'valueMeetsConstraint',
    value: valueSchema.required(),
    constraint: valueConstraintSchema.required()
});
