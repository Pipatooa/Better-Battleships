import { builtinAttributePrefix } from './sources/builtin-attributes';
import type { IAttributeInfo }    from '../../../../../shared/network/scenario/i-attribute-info';
import type { AttributeMap }      from './i-attribute-holder';

/**
 * AttributeWatcher - Server Version
 *
 * Collates attribute value updates until they can be exported in bulk
 */
export class AttributeWatcher {

    private updates: { [name: string]: number } = {};
    private _updatesAvailable = false;

    private readonly oldAttributeValues: { [name: string]: number } = {};
    private readonly oldBuiltinAttributeValues: { [name: string]: number } = {};

    /**
     * AttributeWatcher constructor
     *
     * @param  attributes        Regular attributes to watch for updates
     * @param  builtinAttributes Built-in attributes to watch for updates
     */
    public constructor(private readonly attributes: AttributeMap,
                       private readonly builtinAttributes: AttributeMap) {

        for (const [name, attribute] of Object.entries(this.attributes))
            if (attribute.descriptor !== undefined)
                attribute.attributeUpdateCallback = (newValue: number) => {
                    if (newValue === this.oldAttributeValues[name])
                        return;
                    this.updates[name] = newValue;
                    this._updatesAvailable = true;
                };

        for (const [name, attribute] of Object.entries(this.builtinAttributes))
            if (attribute.descriptor !== undefined)
                attribute.attributeUpdateCallback = (newValue: number) => {
                    if (newValue === this.oldBuiltinAttributeValues[name])
                        return;
                    this.updates[`${builtinAttributePrefix}${name}`] = newValue;
                    this._updatesAvailable = true;
                };
    }

    /**
     * Exports attribute info describing all attribute that this attribute watcher watches
     *
     * @returns  Dictionary of attribute names to IAttributeInfo objects
     */
    public exportAttributeInfo(): { [name: string]: IAttributeInfo } {
        const attributeInfo: { [name: string]: IAttributeInfo } = {};
        for (const [ name, attribute ] of Object.entries(this.attributes))
            if (attribute.descriptor !== undefined) {
                const info = attribute.makeTransportable();
                attributeInfo[name] = info;
                this.oldAttributeValues[name] = info.value;
            }
        for (const [ name, attribute ] of Object.entries(this.builtinAttributes))
            if (attribute.descriptor !== undefined) {
                const info = attribute.makeTransportable();
                attributeInfo[`${builtinAttributePrefix}${name}`] = info;
                this.oldBuiltinAttributeValues[name] = info.value;
            }
        return attributeInfo;
    }

    /**
     * Exports attribute values which have been changed since last export
     *
     * @returns  Dictionary of attribute names to their new values
     */
    public exportUpdates(): { [name: string]: number } {
        const updates = this.updates;
        this.updates = {};
        this._updatesAvailable = false;
        return updates;
    }

    /**
     * Getters and setters
     */

    public get updatesAvailable(): boolean {
        return this._updatesAvailable;
    }
}
