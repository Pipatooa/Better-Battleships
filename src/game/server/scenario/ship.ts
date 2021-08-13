import Joi from 'joi';
import {Ability, IAbilitySource} from './abilities/ability';
import {Attribute, IAttributeSource} from './attributes/attribute';
import {attributeHolderSchema, AttributeMap, IAttributeHolder} from './attributes/i-attribute-holder';
import {Descriptor, descriptorSchema, IDescriptorSource} from './common/descriptor';
import {genericNameSchema} from './common/generic-name';
import {IPatternSource, Pattern, patternSchema} from './common/pattern';
import {Rotation} from './common/rotation';
import {ParsingContext} from './parsing-context';
import {getJSONFromEntry, UnpackingError} from './unpacker';

/**
 * Ship - Server Version
 *
 * Movable object that exists on the board
 */
export class Ship implements IAttributeHolder {

    public x: number = 0;
    public y: number = 0;

    public constructor(public readonly descriptor: Descriptor,
                       protected _pattern: Pattern,
                       public readonly abilities: { [name: string]: Ability },
                       public readonly attributes: AttributeMap) {
    }

    /**
     * Rotates the ship in place
     * @param rotation Amount to rotate ship by
     */
    public rotate(rotation: Rotation) {
        this._pattern = this._pattern.rotated(rotation);
    }

    /**
     * Returns a list of the coordinates of every cell that this ship occupies.
     *
     * @param offset Optional offset to apply to cell coordinates
     */
    public getCells(offset: [number, number] = [0, 0]): [number, number][] {
        let cells: [number, number][] = [];

        // Iterate through entries in pattern
        this._pattern.forEachEntry((dx, dy, value) => {

            // Offset pattern entries by the position of the ship and offset provided
            let x = dx + this.x + offset[0];
            let y = dy + this.y + offset[1];

            // Add cell coordinate to list of cells
            cells.push([x, y]);
        });

        // Return list of cell coordinates
        return cells;
    }

    /**
     * Factory function to generate Ship from JSON scenario data
     * @param parsingContext Context for resolving scenario data
     * @param shipSource JSON data for Ship
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

        // Get pattern
        let pattern: Pattern = await Pattern.fromSource(parsingContext, shipSource.pattern);

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
        return new Ship(descriptor, pattern, abilities, attributes);
    }
}

/**
 * JSON source interface reflecting schema
 */
export interface IShipSource {
    descriptor: IDescriptorSource;
    pattern: IPatternSource;
    abilities: string[];
    attributes: { [name: string]: IAttributeSource };
}

/**
 * Schema for validating source JSON data
 */
export const shipSchema = Joi.object({
    descriptor: descriptorSchema.required(),
    pattern: patternSchema.required(),
    abilities: Joi.array().items(genericNameSchema).required()
}).concat(attributeHolderSchema);