import Joi from 'joi';
import {
    attributeHolderSchema,
    AttributeMap,
    AttributeMapSource,
    IAttributeHolder
} from '../attributes/i-attribute-holder';
import { descriptorSchema, IDescriptorSource } from '../common/descriptor';
import { ParsingContext } from '../parsing-context';

/**
 * Ability - Server Version
 *
 * Not Yet Implemented
 */
export class Ability implements IAttributeHolder {
    public readonly attributes: AttributeMap = {};

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,require-jsdoc
    public static async fromSource(parsingContext: ParsingContext, abilitySource: IAbilitySource, checkSchema: boolean): Promise<Ability> {
        return new Ability();
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IAbilitySource {
    descriptor: IDescriptorSource;
    attributes: AttributeMapSource;
}

/**
 * Schema for validating source JSON data
 */
export const abilitySchema = Joi.object({
    descriptor: descriptorSchema.required()
}).concat(attributeHolderSchema);