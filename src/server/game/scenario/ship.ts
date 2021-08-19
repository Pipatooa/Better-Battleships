import Joi from 'joi';
import {Ability, IAbilitySource} from './abilities/ability';
import {Attribute, IAttributeSource} from './attributes/attribute';
import {attributeHolderSchema, AttributeMap, IAttributeHolder} from './attributes/i-attribute-holder';
import {Descriptor, descriptorSchema, IDescriptorSource} from './common/descriptor';
import {genericNameSchema} from './common/generic-name';
import {IPatternSource, Pattern, patternSchema} from './common/pattern';
import {Rotation} from './common/rotation';
import {ParsingContext} from './parsing-context';
import {checkAgainstSchema} from './schema-checker';
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
    public rotate(rotation: Rotation): void {
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
        this._pattern.forEachEntry((dx: number, dy: number, value: number) => {

            // Offset pattern entries by the position of the ship and offset provided
            let x: number = dx + this.x + offset[0];
            let y: number = dy + this.y + offset[1];

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
     * @param checkSchema When true, validates source JSON data against schema
     * @returns ship -- Created Ship object
     */
    public static async fromSource(parsingContext: ParsingContext, shipSource: IShipSource, checkSchema: boolean): Promise<Ship> {

        // Validate JSON data against schema
        if (checkSchema)
            shipSource = await checkAgainstSchema(shipSource, shipSchema, parsingContext);

        // Get attributes
        let attributes: AttributeMap = {};
        for (let [name, attributeSource] of Object.entries(shipSource.attributes)) {
            attributes[name] = await Attribute.fromSource(parsingContext.withExtendedPath(`.attributes.${name}`), attributeSource, false);
        }

        // Update parsing context
        parsingContext = parsingContext.withShipAttributes(attributes);

        // Get descriptor
        let descriptor = await Descriptor.fromSource(parsingContext.withExtendedPath('.descriptor'), shipSource.descriptor, false);

        // Get pattern
        let pattern = await Pattern.fromSource(parsingContext.withExtendedPath('.pattern'), shipSource.pattern, false);

        // Get abilities
        let abilities: { [name: string]: Ability } = {};
        for (let i = 0; i < shipSource.abilities.length; i++) {
            let abilityName = shipSource.abilities[i];

            // If ship does not exist
            if (!(abilityName in parsingContext.abilityEntries))
                throw new UnpackingError(`Could not find 'abilities/${abilityName}.json'`, parsingContext);

            // If ability already exists
            if (abilityName in abilities)
                throw new UnpackingError(`Ship cannot define the same ability twice '${abilityName}' at '${parsingContext.currentPath}.abilities[${i}]'`, parsingContext);

            // Unpack ability data
            let abilitySource: IAbilitySource = await getJSONFromEntry(parsingContext.abilityEntries[abilityName]) as unknown as IAbilitySource;
            abilities[abilityName] = await Ability.fromSource(parsingContext.withUpdatedFile(`abilities/${abilityName}.json`), abilitySource, true);

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