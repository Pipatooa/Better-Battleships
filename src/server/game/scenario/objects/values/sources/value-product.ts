import type { IValueMultipleSource } from './value-multiple';
import { valueMultipleSchema } from './value-multiple';

/**
 * Schema for validating source JSON data
 */
export const valueProductSchema = valueMultipleSchema.keys({
    type: 'product'
});

/**
 * JSON source interface reflecting schema
 */
export interface IValueProductSource extends IValueMultipleSource {
    type: 'product';
}
