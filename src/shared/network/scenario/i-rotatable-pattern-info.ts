import type { IPatternInfo } from './i-pattern-info';

/**
 * Portable network version of RotatablePattern object
 */
export interface IRotatablePatternInfo extends IPatternInfo {
    rotationCenter: number
}
