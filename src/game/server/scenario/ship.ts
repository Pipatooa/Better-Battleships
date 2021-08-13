import Joi from 'joi';
import {Ability, IAbilitySource} from './abilities/ability';
import {Attribute, IAttributeSource} from './attributes/attribute';
import {attributeHolderSchema, AttributeMap, IAttributeHolder} from './attributes/i-attribute-holder';
import {Descriptor, descriptorSchema, IDescriptorSource} from './common/descriptor';
import {genericNameSchema} from './common/generic-name';
import {ParsingContext} from './parsing-context';
import {getJSONFromEntry, UnpackingError} from './unpacker';

/**
 * Ship - Server Version
 *
 * Movable object that exists on the board
 */
export class Ship implements IAttributeHolder {
    public constructor(public readonly descriptor: Descriptor,
                       public readonly abilities: { [name: string]: Ability },
                       public readonly attributes: AttributeMap) {
    }

    /**
     * Factory function to generate Ship from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param shipSource JSON data for Ship
     * @param abilityEntries ZIP entry list of JSON abilities
     * @returns ship -- Created Ship object
     */
    public static async fromSource(parsingContext: ParsingContext, shipSource: IShipSource): Promise<Ship> {
        // Validate JSON data against schema
        try {
            shipSource = await shipSchema.validateAsync(shipSource);
        } catch (e) {
            if (e instanceof Joi.ValidationError)
                throw UnpackingError.fromJoiValidationError(e);
            throw e;
        }

        // Get attributes
        let attributes: AttributeMap = {};
        for (let [name, attributeSource] of Object.entries(shipSource.attributes)) {
            attributes[name] = await Attribute.fromSource(parsingContext, attributeSource);
        }

        // Update parsing context
        parsingContext = parsingContext.withShipAttributes(attributes);

        // Get descriptor
        let descriptor: Descriptor = await Descriptor.fromSource(parsingContext, shipSource.descriptor);

        // Get abilities
        let abilities: { [name: string]: Ability } = {};
        for (let abilityName of shipSource.abilities) {

            // If ship does not exist
            if (!(abilityName in parsingContext.abilityEntries))
                throw new UnpackingError(`Could not find 'abilities/${abilityName}.json'`);

            // If ability already exists
            if (abilityName in abilities)
                throw new UnpackingError(`Cannot define `);

            // Unpack ability data
            let abilitySource = await getJSONFromEntry(parsingContext.abilityEntries[abilityName]) as unknown as IAbilitySource;

            try {
                abilities[abilityName] = await Ability.fromSource(parsingContext, abilitySource);
            } catch (e) {
                if (e instanceof UnpackingError)
                    throw e.hasContext() ? e : e.withContext(`abilities/${abilityName}.json`);
                throw e;
            }
        }

        // Return created Ship object
        return new Ship(descriptor, abilities, attributes);
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