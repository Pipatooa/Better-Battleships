import Joi                        from 'joi';
import { colorSchema }            from '../common/sources/color';
import { descriptorSchema }       from '../common/sources/descriptor';
import type { IDescriptorSource } from '../common/sources/descriptor';

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
    color: colorSchema.required(),
    traversable: Joi.boolean().required()
});
