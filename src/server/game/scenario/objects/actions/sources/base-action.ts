import Joi from 'joi';
import type { ConditionSource } from '../../conditions/sources/condition';
import { conditionSchema } from '../../conditions/sources/condition';

/**
 * JSON source interface reflecting base action schema
 */
export interface IBaseActionSource {
    type: string,
    condition: ConditionSource | Record<string, never>;
}

/**
 * Base schema for validating source JSON data
 */
export const baseActionSchema = Joi.object({
    type: Joi.string().required(),
    condition: Joi.alternatives(
        Joi.object().required(),
        conditionSchema.required()
    ).required()
});
