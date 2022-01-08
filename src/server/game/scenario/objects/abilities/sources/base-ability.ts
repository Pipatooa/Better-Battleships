import Joi                             from 'joi';
import { baseEventInfo }               from '../../../events/base-events';
import { actionSchema }                from '../../actions/sources/action';
import { attributeHolderSchema }       from '../../attributes/sources/attribute-holder';
import { descriptorSchema }            from '../../common/sources/descriptor';
import { nullableConditionSchema }     from '../../conditions/sources/condition';
import type { ActionSource }           from '../../actions/sources/action';
import type { IAttributeHolderSource } from '../../attributes/sources/attribute-holder';
import type { IDescriptorSource }      from '../../common/sources/descriptor';
import type { ConditionSource }        from '../../conditions/sources/condition';
import type { AbilityEvent }           from '../events/ability-events';

/**
 * JSON source interface reflecting base ability schema
 */
export interface IBaseAbilitySource extends IAttributeHolderSource {
    type: string,
    descriptor: IDescriptorSource,
    icon: string,
    condition: ConditionSource,
    actions: { [event in AbilityEvent]: ActionSource[] }
}

/**
 * Base schema for validating source JSON data
 */
export const baseAbilitySchema = Joi.object({
    type: Joi.string().required(),
    descriptor: descriptorSchema.required(),
    icon: Joi.string().required(),
    condition: nullableConditionSchema.required(),
    actions: Joi.object().pattern(Joi.valid(...Object.keys(baseEventInfo)), Joi.array().items(actionSchema.keys({
        priority: Joi.number().required()
    }))).required()
}).concat(attributeHolderSchema);
