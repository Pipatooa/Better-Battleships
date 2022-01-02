import type { MultipleAttributeInfo } from './i-attribute-info';

/**
 * Portable network version of Player object
 */
export interface IPlayerInfo {
    color: string,
    highlightColor: string,
    attributes: MultipleAttributeInfo
}
