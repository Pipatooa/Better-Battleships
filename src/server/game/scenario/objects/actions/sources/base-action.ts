import Joi                         from 'joi';
import { nullableConditionSchema } from '../../conditions/sources/condition';
import type { ConditionSource }    from '../../conditions/sources/condition';

/**
 * JSON source interface reflecting base action schema
 */
export interface IBaseActionSource {
    type: string,
    priority: number | undefined,
    condition: ConditionSource;
}

/**
 * Base schema for validating source JSON data
 */
export const baseActionSchema = Joi.object({
    type: Joi.string().required(),
    condition: nullableConditionSchema.required()
});
