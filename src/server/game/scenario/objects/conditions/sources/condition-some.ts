import { valueConstraintSchema }         from '../../constraints/sources/value-constraint';
import { conditionMultipleSchema }       from './condition-multiple';
import type { IValueConstraintSource }   from '../../constraints/sources/value-constraint';
import type { IConditionMultipleSource } from './condition-multiple';

/**
 * JSON source interface reflecting schema
 */
export interface IConditionSomeSource extends IConditionMultipleSource {
    type: 'some',
    valueConstraint: IValueConstraintSource
}

/**
 * Schema for validating source JSON data
 */
export const conditionSomeSchema = conditionMultipleSchema.keys({
    type: 'some',
    valueConstraint: valueConstraintSchema
});
