import { builtinAttributePrefix }                       from 'shared/scenario/builtin-attribute-prefix';
import type { AttributeMap }                            from './i-attribute-holder';
import type { AttributeUpdates, MultipleAttributeInfo } from 'shared/network/scenario/i-attribute-info';

/**
 * AttributeWatcher - Server Version
 *
 * Collates attribute value updates until they can be exported in bulk
 */
export class AttributeWatcher {

    private readonly attributeUpdateCallbacks: { [name: string]: (newValue: number) => void } = {};
    private readonly builtinAttributeUpdateCallbacks: { [name: string]: (newValue: number) => void } = {};

    private readonly oldAttributeValues: AttributeUpdates = {};
    private readonly oldBuiltinAttributeValues: AttributeUpdates = {};

    private _updatesAvailable = false;
    private updates: AttributeUpdates = {};

    /**
     * AttributeWatcher constructor
     *
     * @param  attributes        Regular attributes to watch for updates
     * @param  builtinAttributes Built-in attributes to watch for updates
     */
    public constructor(private readonly attributes: AttributeMap,
                       private readonly builtinAttributes: AttributeMap) {

        for (const [name, attribute] of Object.entries(this.builtinAttributes))
            if (attribute.descriptor !== undefined) {
                const callback = (newValue: number): void => {
                    if (newValue === this.oldBuiltinAttributeValues[name])
                        return;
                    this.oldBuiltinAttributeValues[name] = newValue;
                    this.updates[`${builtinAttributePrefix}${name}`] = newValue;
                    this._updatesAvailable = true;
                };
                attribute.addAttributeUpdateCallback(callback);
                this.builtinAttributeUpdateCallbacks[name] = callback;
            }
        for (const [name, attribute] of Object.entries(this.attributes))
            if (attribute.descriptor !== undefined) {
                const callback = (newValue: number): void => {
                    if (newValue === this.oldAttributeValues[name])
                        return;
                    this.oldAttributeValues[name] = newValue;
                    this.updates[name] = newValue;
                    this._updatesAvailable = true;
                };
                attribute.addAttributeUpdateCallback(callback);
                this.attributeUpdateCallbacks[name] = callback;
            }
    }

    /**
     * Allows this object to be discarded
     */
    public deconstruct(): void {
        for (const [name, attribute] of Object.entries(this.builtinAttributes))
            if (attribute.descriptor !== undefined) {
                const callback = this.builtinAttributeUpdateCallbacks[name];
                attribute.removeAttributeUpdateCallback(callback);
            }
        for (const [name, attribute] of Object.entries(this.attributes))
            if (attribute.descriptor !== undefined) {
                const callback = this.attributeUpdateCallbacks[name];
                attribute.removeAttributeUpdateCallback(callback);
            }
    }

    /**
     * Exports attribute info describing all attribute that this attribute watcher watches
     *
     * @returns  Dictionary of attribute names to IAttributeInfo objects
     */
    public exportAttributeInfo(): MultipleAttributeInfo {
        const attributeInfo: MultipleAttributeInfo = {};
        for (const [name, attribute] of Object.entries(this.builtinAttributes))
            if (attribute.descriptor !== undefined) {
                const info = attribute.makeTransportable();
                attributeInfo[`${builtinAttributePrefix}${name}`] = info;
                this.oldBuiltinAttributeValues[name] = info.value;
            }
        for (const [name, attribute] of Object.entries(this.attributes))
            if (attribute.descriptor !== undefined) {
                const info = attribute.makeTransportable();
                attributeInfo[name] = info;
                this.oldAttributeValues[name] = info.value;
            }
        return attributeInfo;
    }

    /**
     * Exports attribute values which have been changed since last export
     *
     * @returns  Dictionary of attribute names to their new values
     */
    public exportUpdates(): AttributeUpdates {
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
