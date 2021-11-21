import type { Attribute }        from './attribute';
import type { IAttributeSource } from './sources/attribute';

/**
 * Type describing a dictionary of string (name) indexed attributes
 */
export type AttributeMap = { [name: string]: Attribute };

/**
 * Type describing a dictionary of string (name) index attribute sources
 */
export type AttributeMapSource = { [name: string]: IAttributeSource };

