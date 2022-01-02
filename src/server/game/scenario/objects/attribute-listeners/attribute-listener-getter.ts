import { AttributeListener }             from './attribute-listener';
import type { EventRegistrar }           from '../../events/event-registrar';
import type { ParsingContext }           from '../../parsing-context';
import type { IAttributeListenerSource } from './sources/attribute-listener';

/**
 * Gets an array of attribute listeners from JSON scenario data
 *
 * @param    parsingContext           Context for resolving objects and values when an event is triggered
 * @param    attributeListenerSources JSON data for attribute listeners
 * @param    eventRegistrar           Event registrar to register internal listeners under
 * @returns                           Array of AttributeListener objects
 */
export async function getAttributeListeners(parsingContext: ParsingContext, attributeListenerSources: IAttributeListenerSource[], eventRegistrar: EventRegistrar<any, string>): Promise<AttributeListener[]> {
    const attributeListeners: AttributeListener[] = [];
    for (let i = 0; i < attributeListenerSources.length; i++) {
        const attributeListenerSource = attributeListenerSources[i];
        const attributeListener = await AttributeListener.fromSource(parsingContext.withExtendedPath(`[${i}]`), attributeListenerSource, eventRegistrar, false);
        parsingContext.reducePath();
        attributeListeners.push(attributeListener);
    }
    return attributeListeners;
}
