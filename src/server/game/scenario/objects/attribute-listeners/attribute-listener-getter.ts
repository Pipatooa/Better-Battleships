import { AttributeListener }             from './attribute-listener';
import type { ParsingContext }           from '../../parsing-context';
import type { IAttributeListenerSource } from './sources/attribute-listener';

/**
 * Gets an array of attribute listeners from JSON scenario data
 *
 * @param    parsingContext           Context for resolving objects and values when an event is triggered
 * @param    attributeListenerSources JSON data for attribute listeners
 * @returns                           Array of AttributeListener objects
 */
export async function getAttributeListeners(parsingContext: ParsingContext, attributeListenerSources: IAttributeListenerSource[]): Promise<AttributeListener[]> {
    const attributeListeners: AttributeListener[] = [];
    for (let i = 0; i < attributeListenerSources.length; i++) {
        const attributeListenerSource = attributeListenerSources[i];
        const attributeListener = await AttributeListener.fromSource(parsingContext.withExtendedPath(`[${i}]`), attributeListenerSource, false);
        parsingContext.reducePath();
        attributeListeners.push(attributeListener);
    }
    return attributeListeners;
}
