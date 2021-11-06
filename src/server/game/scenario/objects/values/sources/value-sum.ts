import type { IValueMultipleSource } from './value-multiple';
import { valueMultipleSchema } from './value-multiple';

/**
 * Schema for validating source JSON data
 */
export const valueSumSchema = valueMultipleSchema.keys({
    type: 'sum'
});

/**
 * JSON source interface reflecting schema
 */
export interface IValueSumSource extends IValueMultipleSource {
    type: 'sum';
}
