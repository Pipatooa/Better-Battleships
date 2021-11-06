import type { IConditionMultipleSource } from './condition-multiple';
import { conditionMultipleSchema } from './condition-multiple';

/**
 * JSON source interface reflecting schema
 */
export interface IConditionAnySource extends IConditionMultipleSource {
    type: 'any';
}

/**
 * Schema for validating source JSON data
 */
export const conditionAnySchema = conditionMultipleSchema.keys({
    type: 'any'
});
