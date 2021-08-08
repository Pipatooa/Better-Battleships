import Joi from 'joi';
import {Ability} from './abilities/ability';
import {IAttributeSource} from './attributes/attribute';
import {attributeHolderSchema, AttributeMap, IAttributeHolder} from './attributes/i-attribute-holder';
import {descriptorSchema, IDescriptorSource} from './common/descriptor';
import {genericNameSchema} from './common/generic-name';
import {zipEntryMap} from './unpacker';

/**
 * Ship - Server Version
 *
 * Not Yet Implemented
 */
export class Ship implements IAttributeHolder {
    public readonly attributes: AttributeMap = {};
    public readonly abilities: Ability[] = [];

    /**
     * Factory function to generate Ship from JSON scenario data
     * @param shipSource JSON data for Ship
     * @param abilityEntries ZIP entry list of JSON abilities
     * @returns ship -- Created Ship object
     */
    public static async fromSource(shipSource: IShipSource,
                                   abilityEntries: zipEntryMap): Promise<Ship> {
        return new Ship();
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IShipSource {
    descriptor: IDescriptorSource;
    abilities: string[];
    attributes: { [name: string]: IAttributeSource };
}

/**
 * Schema for validating source JSON data
 */
export const shipSchema = Joi.object({
    descriptor: descriptorSchema.required(),
    abilities: Joi.array().items(genericNameSchema).required()
}).concat(attributeHolderSchema);