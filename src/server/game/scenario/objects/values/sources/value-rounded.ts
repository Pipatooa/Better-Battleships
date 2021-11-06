import type { IBaseValueSource } from './base-value';
import { baseValueSchema } from './base-value';
import type { ValueSource } from './value';
import { valueSchema } from './value';

/**
 * Schema for validating source JSON data
 */
export const valueRoundedSchema = baseValueSchema.keys({
    type: 'round',
    value: valueSchema.required(),
    step: valueSchema.required()
});

/**
 * JSON source interface reflecting schema
 */
export interface IValueRoundedSource extends IBaseValueSource {
    type: 'round',
    value: ValueSource,
    step: ValueSource
}
