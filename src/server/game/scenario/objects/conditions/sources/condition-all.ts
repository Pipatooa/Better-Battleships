import type { IConditionMultipleSource } from './condition-multiple';
import { conditionMultipleSchema } from './condition-multiple';

/**
 * JSON source interface reflecting schema
 */
export interface IConditionAllSource extends IConditionMultipleSource {
    type: 'all';
}

/**
 * Schema for validating source JSON data
 */
export const conditionAllSchema = conditionMultipleSchema.keys({
    type: 'all'
});
