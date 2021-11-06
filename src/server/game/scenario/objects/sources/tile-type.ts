import Joi from 'joi';
import type { IDescriptorSource } from '../common/sources/descriptor';
import { descriptorSchema } from '../common/sources/descriptor';

/**
 * JSON source interface reflecting schema
 */
export interface ITileTypeSource {
    descriptor: IDescriptorSource,
    color: string,
    traversable: boolean
}

/**
 * Schema for validating source JSON data
 */
export const tileTypeSchema = Joi.object({
    descriptor: descriptorSchema.required(),
    color: Joi.string().regex(/#[0-9a-fA-F]{6}/).required(),
    traversable: Joi.boolean().required()
});
