/**
 * Record describing all attribute listener events
 */
export const attributeListenerEventInfo = {
    onAttributeUpdate: [[], []]
} as const;

/**
 * Type matching record describing all attribute listener events
 */
export type AttributeListenerEventInfo = typeof attributeListenerEventInfo;

/**
 * Type matching all global event name strings
 */
export type AttributeListenerEvent = keyof AttributeListenerEventInfo;
