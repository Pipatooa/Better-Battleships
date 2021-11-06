import Joi from 'joi';
import type { ActionSource } from '../../actions/sources/action';
import { actionSchema } from '../../actions/sources/action';
import type { AttributeMapSource } from '../../attributes/i-attribute-holder';
import { attributeHolderSchema } from '../../attributes/sources/attribute-holder';
import type { IDescriptorSource } from '../../common/sources/descriptor';
import { descriptorSchema } from '../../common/sources/descriptor';
import type { ConditionSource } from '../../conditions/sources/condition';
import { conditionSchema } from '../../conditions/sources/condition';
import type { AbilityEvent } from '../events/base-ability-events';
import { baseAbilityEvents } from '../events/base-ability-events';

/**
 * JSON source interface reflecting base ability schema
 */
export interface IBaseAbilitySource {
    descriptor: IDescriptorSource,
    condition: ConditionSource,
    actions: { [event in AbilityEvent]: ActionSource[] },
    attributes: AttributeMapSource
}

/**
 * Base schema for validating source JSON data
 */
export const baseAbilitySchema = Joi.object({
    type: Joi.string().required(),
    descriptor: descriptorSchema.required(),
    condition: conditionSchema.required(),
    actions: Joi.object().pattern(Joi.valid(...baseAbilityEvents), Joi.array().items(actionSchema)).required()
}).concat(attributeHolderSchema);
